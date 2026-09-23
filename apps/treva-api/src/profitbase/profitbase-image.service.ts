import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';

/** Matches upload.controller.ts, which owns the same two settings. */
const uploadsDir = join(process.cwd(), process.env.UPLOADS_DIR ?? 'uploads');
const uploadsServeRoot = process.env.UPLOADS_SERVE_ROOT ?? '/uploads';

/** Where copied Profitbase media lands, beside images/ videos/ documents/. */
const FOLDER = 'profitbase';

/** Long enough that two drawings cannot collide, short enough to read. */
const HASH_LENGTH = 32;

const FETCH_TIMEOUT_MS = 20_000;

/**
 * Nothing Profitbase serves is legitimately larger than this. House renders
 * reach nearly 30MB; the resize below takes them down to a few hundred KB.
 */
const MAX_BYTES = 40 * 1024 * 1024;

/**
 * The longest side a stored image keeps.
 *
 * Profitbase's originals run to about 1.7MB apiece — renders and photographs,
 * not the light line art the word "plan" suggests. 2000px is more than any
 * screen downstream asks for, and takes the typical file to roughly 150KB.
 */
const MAX_EDGE = 2000;

const QUALITY = 82;

/** How many downloads run at once. */
const CONCURRENCY = 4;

/**
 * libvips keeps decoded images in a cache and opens a thread per core, which
 * for a sync that walks ten thousand photographs is a resident set that grows
 * until the box runs out and connections start dropping. Nothing here is read
 * twice, so the cache buys nothing; one thread per image with four in flight is
 * plenty of parallelism.
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
 * Copies the images a Profitbase sync points at onto this API's own storage.
 *
 * Profitbase is this platform's upstream, and it should be this service that
 * talks to it — nothing downstream. Until now the sync stored Profitbase's own
 * URLs, so every consumer (and every consumer's users) fetched the pictures
 * from Profitbase directly, forever. Copying them once here makes treva-api the
 * single place that address is ever resolved.
 *
 * Files are named after a hash of their stored bytes: Profitbase serves every
 * unit its own copy of the same plan, so identical drawings collapse onto one
 * file however many units point at it.
 */
@Injectable()
export class ProfitbaseImageService {
  private readonly logger = new Logger(ProfitbaseImageService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Copies every distinct URL given and answers with the local address of each
   * one now held. A URL missing from the result could not be fetched; the
   * caller keeps Profitbase's address for it, because a picture served from
   * upstream still beats no picture.
   */
  async mirrorAll(urls: Iterable<string>): Promise<Map<string, string>> {
    const wanted = [
      ...new Set(
        [...urls].filter(
          (url) => url && !url.startsWith(`${uploadsServeRoot}/`),
        ),
      ),
    ];

    const mirrored = new Map<string, string>();
    if (!wanted.length) return mirrored;

    const known = await this.prisma.profitbaseImage.findMany({
      where: { sourceUrl: { in: wanted } },
      select: { sourceUrl: true, url: true },
    });

    for (const row of known) mirrored.set(row.sourceUrl, row.url);

    const pending = wanted.filter((url) => !mirrored.has(url));
    if (!pending.length) return mirrored;

    await mkdir(join(uploadsDir, FOLDER), { recursive: true });

    let stored = 0;
    let cursor = 0;

    const worker = async () => {
      while (cursor < pending.length) {
        const url = pending[cursor++];
        const local = await this.mirror(url);
        if (!local) continue;

        mirrored.set(url, local);
        stored += 1;

        // Recorded per image rather than in one batch at the end: an
        // interrupted run otherwise leaves files on disk that nothing can match
        // a URL to, and the next sync downloads the whole inventory again.
        await this.prisma.profitbaseImage
          .create({ data: { sourceUrl: url, url: local } })
          .catch(() => undefined);
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, pending.length) }, worker),
    );

    this.logger.log(
      `Copied ${stored} new images from Profitbase; ${known.length} already stored`,
    );

    return mirrored;
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
        .split(';')[0]
        .trim()
        .toLowerCase();
      const extension = EXTENSION[type];

      if (!extension) {
        this.logger.warn(`${url} is ${type || 'untyped'}, not an image`);
        return null;
      }

      // Read from the header first, so an oversized file costs a header rather
      // than the whole download.
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

      // Hashed after the resize: the name has to describe the stored bytes, or
      // the next sync looks for a file that is not there.
      const name = `${createHash('sha256')
        .update(data)
        .digest('hex')
        .slice(0, HASH_LENGTH)}.${extension}`;
      const path = join(uploadsDir, FOLDER, name);

      const exists = await access(path).then(
        () => true,
        () => false,
      );
      if (!exists) await writeFile(path, data);

      return `${uploadsServeRoot}/${FOLDER}/${name}`;
    } catch (error) {
      this.logger.warn(
        `${url} could not be copied: ${error instanceof Error ? error.message : error}`,
      );
      return null;
    }
  }

  /**
   * Brings an image down to something worth serving. Answers the original
   * bytes when there is nothing to do — an SVG, or a file sharp will not read.
   */
  private async resize(
    url: string,
    body: Buffer,
    extension: string,
  ): Promise<Buffer> {
    if (extension === 'svg') return body;

    try {
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
