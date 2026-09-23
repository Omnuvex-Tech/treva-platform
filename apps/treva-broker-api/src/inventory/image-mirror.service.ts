import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';
import { UPLOADS_DIR, UPLOADS_ROUTE } from '../uploads/uploads.controller';

/** Where mirrored drawings and building photos land, under UPLOADS_DIR. */
export const SYNCED_IMAGES_FOLDER = 'synced';

/** Long enough that a drawing cannot collide, short enough to read in a path. */
const HASH_LENGTH = 32;

/** A drawing that does not arrive in this long is not worth holding the sync. */
const FETCH_TIMEOUT_MS = 20_000;

/** No architectural drawing is this big; anything that claims to be is wrong. */
const MAX_BYTES = 12 * 1024 * 1024;

/**
 * The longest side a stored image keeps.
 *
 * The developer's originals run to 1.7MB apiece — renders and photographs, not
 * the light line art the name "drawing" suggests — and the whole inventory at
 * that size is several gigabytes of disk and a megabyte-and-a-half on the wire
 * per unit the rail opens. 2000px is still more than any screen in the app
 * asks for, so nothing visible is lost.
 */
const MAX_EDGE = 2000;

/** Re-encode quality. 82 is where these stop shedding anything visible. */
const QUALITY = 82;

/** How many downloads are in flight at once. */
const CONCURRENCY = 4;

/**
 * libvips keeps decoded images in a cache and opens a thread per core, which
 * over a whole inventory is a resident set that grows until the box runs out
 * and connections start dropping. Nothing here is read twice, so the cache
 * buys nothing.
 */
sharp.cache(false);
sharp.concurrency(1);

const EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
};

/**
 * Copies the images a synchronisation points at onto this API's own storage.
 *
 * The inventory arrives as URLs on the developer's CDN, and until now that is
 * all the broker stored: every viewer fetched every drawing from Profitbase,
 * across the network, on every first view. Mirroring them once at sync time
 * puts them behind this API's own /uploads, where treva-broker already proxies
 * them.
 *
 * Files are named after a hash of their bytes rather than after the unit. That
 * is the point of the exercise: Profitbase serves every unit its own copy of
 * the same plan, so a 200-unit building is 200 URLs of perhaps 30 distinct
 * drawings. Hashing collapses them onto one file each — stored once, and
 * fetched by the browser once however many units share it.
 */
@Injectable()
export class ImageMirrorService {
  private readonly logger = new Logger(ImageMirrorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mirrors every distinct URL given, and answers with the local address of
   * each one this API now holds.
   *
   * A URL that is missing from the result could not be fetched: the caller
   * keeps the remote address for it, because a drawing served slowly from
   * Profitbase still beats no drawing at all.
   */
  async mirrorAll(urls: Iterable<string>): Promise<Map<string, string>> {
    const wanted = [
      ...new Set([...urls].filter((url) => url && !this.isLocal(url))),
    ];

    const mirrored = new Map<string, string>();
    if (!wanted.length) return mirrored;

    // Anything mirrored by an earlier sync is answered from the table rather
    // than fetched again. Without this every sync would re-download the whole
    // inventory, because a file is named after bytes it has yet to see.
    const known = await this.prisma.syncedImage.findMany({
      where: { sourceUrl: { in: wanted } },
      select: { sourceUrl: true, url: true },
    });

    for (const row of known) mirrored.set(row.sourceUrl, row.url);

    const pending = wanted.filter((url) => !mirrored.has(url));
    if (!pending.length) return mirrored;

    await mkdir(join(UPLOADS_DIR, SYNCED_IMAGES_FOLDER), { recursive: true });

    let stored = 0;
    let cursor = 0;

    const worker = async () => {
      while (cursor < pending.length) {
        const url = pending[cursor++]!;
        const local = await this.mirror(url);
        if (!local) continue;

        mirrored.set(url, local);
        stored += 1;

        // Recorded one at a time, on purpose. Batching the whole object at the
        // end loses every download if the run is interrupted — the files sit on
        // disk that nothing can match a URL to, and the next sync fetches them
        // all again. A row per image costs a round trip and makes the migration
        // resumable, which for thousands of drawings is the difference between
        // finishing and starting over.
        //
        // `create` rather than `upsert`: nothing rewrites one of these, and a
        // race between two syncs on the same URL is a duplicate key, not a
        // conflict worth resolving.
        await this.prisma.syncedImage
          .create({ data: { sourceUrl: url, url: local } })
          .catch(() => undefined);
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, pending.length) }, worker),
    );

    this.logger.log(
      `Mirrored ${stored} new images; ${known.length} already stored`,
    );

    return mirrored;
  }

  /** A URL this API already serves, from a previous run or by construction. */
  private isLocal(url: string) {
    return url.startsWith(`${UPLOADS_ROUTE}/`);
  }

  /** One image; null when it could not be stored, which is never fatal. */
  private async mirror(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      if (!response.ok) {
        this.logger.warn(`${url} answered ${response.status}`);
        return null;
      }

      const type = (response.headers.get('content-type') ?? '')
        .split(';')[0]!
        .trim()
        .toLowerCase();
      const extension = EXTENSION[type];

      if (!extension) {
        this.logger.warn(`${url} is ${type || 'untyped'}, not an image`);
        return null;
      }

      // Checked before the body is read, so an oversized drawing costs a header
      // rather than the 13MB one of these actually is.
      const declared = Number(response.headers.get('content-length') ?? 0);

      if (declared > MAX_BYTES) {
        this.logger.warn(`${url} declares ${declared} bytes; skipped`);
        return null;
      }

      const body = Buffer.from(await response.arrayBuffer());

      if (!body.length || body.length > MAX_BYTES) {
        this.logger.warn(`${url} is ${body.length} bytes; skipped`);
        return null;
      }

      const data = await this.resize(url, body, extension);

      // Hashed after the resize, never before: the stored bytes are what the
      // name has to describe, or a second sync would look for a file that is
      // not there and fetch the whole inventory again.
      const name = `${createHash('sha256')
        .update(data)
        .digest('hex')
        .slice(0, HASH_LENGTH)}.${extension}`;
      const path = join(UPLOADS_DIR, SYNCED_IMAGES_FOLDER, name);

      // The name is the content, so a file already there is this same image —
      // every sync after the first writes almost nothing.
      const stored = await access(path).then(
        () => true,
        () => false,
      );
      if (!stored) await writeFile(path, data);

      return `${UPLOADS_ROUTE}/${SYNCED_IMAGES_FOLDER}/${name}`;
    } catch (error) {
      this.logger.warn(
        `${url} could not be mirrored: ${error instanceof Error ? error.message : error}`,
      );
      return null;
    }
  }

  /**
   * Brings an image down to something worth serving.
   *
   * Answers the original bytes when there is nothing to do — an SVG, or a file
   * sharp will not read. A drawing that cannot be resized is still a drawing,
   * so it is stored as it came rather than dropped.
   */
  private async resize(
    url: string,
    body: Buffer,
    extension: string,
  ): Promise<Buffer> {
    if (extension === 'svg') return body;

    try {
      // treva-api now caps what it serves at the same edge, so most of what
      // arrives here is already small enough. Re-encoding it would cost the
      // CPU and a generation of JPEG quality to produce the same picture.
      const { width = 0, height = 0 } = await sharp(body).metadata();

      if (width && height && width <= MAX_EDGE && height <= MAX_EDGE) {
        return body;
      }

      const pipeline = sharp(body, { failOn: 'none' })
        // Applies the EXIF orientation, which is lost once the pixels move.
        .rotate()
        .resize({
          width: MAX_EDGE,
          height: MAX_EDGE,
          fit: 'inside',
          withoutEnlargement: true,
        });

      if (extension === 'png') return await pipeline.png().toBuffer();
      if (extension === 'webp') {
        return await pipeline.webp({ quality: QUALITY }).toBuffer();
      }

      return await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
    } catch (error) {
      this.logger.warn(
        `${url} could not be resized: ${error instanceof Error ? error.message : error}`,
      );
      return body;
    }
  }
}
