import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import type { Prisma } from '../generated/prisma/client';
import type { AuthUser } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { UPLOADS_DIR, UPLOADS_ROUTE } from '../uploads/uploads.controller';
import type {
  DocumentListQueryDto,
  UpdateDocumentDto,
} from './dto/documents.dto';
import { kindForUpload } from './kind';

const DOCUMENT_NOT_FOUND = {
  message: 'File not found',
  code: 'not_found',
} as const;

const withUploader = {
  uploadedBy: { select: { fullName: true } },
} satisfies Prisma.BrokerDocumentInclude;

type DocumentRow = Prisma.BrokerDocumentGetPayload<{
  include: typeof withUploader;
}>;

/**
 * treva-broker's `BrokerDocument`
 * (apps/treva-broker/src/features/brokers/types.ts): dates as ISO strings, the
 * uploader as a name, and the four switches gathered back into one `flags`
 * object. Change both together.
 */
function toDocument(row: DocumentRow) {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    category: row.category,
    language: row.language,
    description: row.description,
    sizeBytes: row.sizeBytes,
    downloads: row.downloads,
    version: row.version,
    uploadedBy: row.uploadedBy.fullName,
    uploadedAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    flags: {
      active: row.active,
      featured: row.featured,
      allowDownload: row.allowDownload,
      notifyBrokers: row.notifyBrokers,
    },
    url: row.url,
  };
}

/**
 * The shared materials library behind the Broker Role screen (873:49451).
 *
 * One library for the whole platform — unlike Clients there is no per-broker
 * book to scope to, so every signed-in user reads the same list. What the role
 * decides is writing (top brokers and admins, per treva-broker's
 * `brokers:create` / `brokers:update`) and whether the Visibility switches
 * apply: a plain broker is the audience those switches are about, so the two
 * that have an audience-facing meaning are enforced against that role alone.
 */
@Injectable()
export class BrokerRoleService {
  constructor(private readonly prisma: PrismaService) {}

  /** Who the "Active" and "Allow Download" switches are aimed at. */
  private isAudience(user: AuthUser) {
    return user.role === 'broker';
  }

  private async find(id: string) {
    const row = await this.prisma.brokerDocument.findUnique({
      where: { id },
      include: withUploader,
    });

    if (!row) throw new NotFoundException(DOCUMENT_NOT_FOUND);
    return row;
  }

  async list(user: AuthUser, query: DocumentListQueryDto) {
    const search = query.search;

    const where: Prisma.BrokerDocumentWhereInput = {
      AND: [
        // "Active" off takes a file out of the library without deleting it;
        // the people who manage the library still have to see it to turn it
        // back on.
        this.isAudience(user) ? { active: true } : {},
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                {
                  uploadedBy: {
                    fullName: { contains: search, mode: 'insensitive' },
                  },
                },
              ],
            }
          : {},
      ],
    };

    const rows = await this.prisma.brokerDocument.findMany({
      where,
      include: withUploader,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    });

    return rows.map(toDocument);
  }

  async detail(user: AuthUser, id: string) {
    const row = await this.find(id);

    if (this.isAudience(user) && !row.active) {
      throw new NotFoundException(DOCUMENT_NOT_FOUND);
    }

    return toDocument(row);
  }

  /**
   * The bytes are already on disk by the time this runs — the controller's
   * `FileInterceptor` stored them. A new row starts on neutral metadata: the
   * category, the language and the description are what the edit screen
   * (873:52019) exists to fill in.
   */
  async create(
    user: AuthUser,
    file: Express.Multer.File,
    name: string | undefined,
  ) {
    // Multer decodes multipart names as latin1; browsers send UTF-8.
    const originalName = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );

    const row = await this.prisma.brokerDocument.create({
      data: {
        name: name?.trim() || originalName,
        kind: kindForUpload(file.mimetype, originalName),
        sizeBytes: file.size,
        url: `${UPLOADS_ROUTE}/documents/${file.filename}`,
        storagePath: `documents/${file.filename}`,
        uploadedById: user.id,
      },
      include: withUploader,
    });

    return toDocument(row);
  }

  async update(id: string, dto: UpdateDocumentDto) {
    await this.find(id);

    const row = await this.prisma.brokerDocument.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category,
        language: dto.language,
        description: dto.description,
        ...dto.flags,
        // The rail shows a version and a "Last Modified" (873:52070 /
        // 873:52085), so saving has to move both. `updatedAt` is Prisma's.
        version: { increment: 1 },
      },
      include: withUploader,
    });

    return toDocument(row);
  }

  /**
   * Counts a download. The file itself is served statically from /uploads, so
   * this is the hook the row's Download chip calls before opening it — and the
   * one place "Allow Download" can be refused.
   */
  async registerDownload(user: AuthUser, id: string) {
    const existing = await this.find(id);

    if (
      this.isAudience(user) &&
      (!existing.active || !existing.allowDownload)
    ) {
      throw new ForbiddenException({
        message: 'This file is not available for download',
        code: 'download_not_allowed',
      });
    }

    const row = await this.prisma.brokerDocument.update({
      where: { id },
      data: {
        downloads: { increment: 1 },
        // Pinned, or `@updatedAt` would move: opening a file is not editing
        // it, and "Last Modified" (873:52085) is about the file's contents.
        // It also decides the list's order, which downloads must not reshuffle.
        updatedAt: existing.updatedAt,
      },
      include: withUploader,
    });

    return toDocument(row);
  }

  async remove(id: string) {
    const existing = await this.find(id);

    await this.prisma.brokerDocument.delete({ where: { id } });

    // Best effort, and after the row is gone: an orphaned file is untidy, a
    // row pointing at a file that is no longer there is a broken screen.
    if (existing.storagePath) {
      await unlink(join(UPLOADS_DIR, existing.storagePath)).catch(() => {});
    }
  }
}
