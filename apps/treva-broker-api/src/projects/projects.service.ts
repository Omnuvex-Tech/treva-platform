import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import type { Prisma, Project as ProjectRow } from '../generated/prisma/client';
import type { AuthUser } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { UPLOADS_DIR, UPLOADS_ROUTE } from '../uploads/uploads.controller';
import { layoutsOf } from '../inventory/floor-plan.service';
import type { ProjectListQueryDto, SaveProjectDto } from './dto/projects.dto';

const PROJECT_NOT_FOUND = {
  message: 'Project not found',
  code: 'not_found',
} as const;

const MATERIAL_NOT_FOUND = {
  message: 'File not found',
  code: 'not_found',
} as const;

/** Where the editor's gallery uploads land, under UPLOADS_DIR. */
export const PROJECT_IMAGES_FOLDER = 'projects';

/**
 * treva-broker's `Project` (apps/treva-broker/src/features/projects/types.ts):
 * dates as ISO strings and the availability columns gathered back into one
 * object. Change both together.
 *
 * Some fields are derived rather than stored. The card's cover is the editor's
 * hero (or, failing that, the first gallery tile) — the editor has no separate
 * cover well. The card's unit counts are Live Availability's, since this API
 * holds no unit inventory for an editor-made project (a synchronised one has
 * them written by the sync). `materials` and `financeRows` answer empty: each
 * belongs to a section (Broker Role, Finance) that does not link its rows to a
 * project yet. `layouts` is the synchronised inventory's, on the detail only.
 */
function toProject(
  row: ProjectRow,
  layouts: ReturnType<typeof layoutsOf> = [],
) {
  return {
    id: row.id,
    name: row.name,
    developer: row.developer,
    location: row.location,
    status: row.status,
    priceFrom: row.priceFrom,
    unitsTotal: row.unitsAvailable + row.unitsReserved + row.unitsSold,
    unitsAvailable: row.unitsAvailable,
    bedroomsFrom: row.bedroomsFrom,
    bedroomsTo: row.bedroomsTo,
    deliveryDate: row.deliveryDate?.toISOString() ?? '',
    updatedAt: row.updatedAt.toISOString(),
    coverImageUrl: row.heroImageUrl ?? row.galleryImageUrls[0] ?? null,
    publicUrl: row.publicUrl,
    heroImageUrl: row.heroImageUrl,
    galleryImageUrls: row.galleryImageUrls,
    highlights: row.highlights,
    offers: row.offers,
    materials: row.materials,
    availability: {
      available: row.unitsAvailable,
      reserved: row.unitsReserved,
      sold: row.unitsSold,
      autoCalculate: row.autoCalculate,
      lastSyncedAt: row.availabilitySyncedAt.toISOString(),
    },
    financeRows: [],
    layouts,
  };
}

/**
 * The download count is the server's, never the editor's: the editor sends the
 * number it loaded, and downloads counted since would be wiped by a save. A row
 * keeps its stored count while it still holds the same file; a new row, or one
 * whose file was replaced, starts at 0.
 */
function withStoredDownloads(
  materials: SaveProjectDto['materials'] & object,
  current: Prisma.JsonValue,
) {
  const stored = new Map<string, number>();
  if (Array.isArray(current)) {
    for (const entry of current as Prisma.JsonObject[]) {
      if (
        entry &&
        typeof entry.id === 'string' &&
        typeof entry.url === 'string'
      ) {
        stored.set(`${entry.id}\n${entry.url}`, Number(entry.downloads) || 0);
      }
    }
  }

  return materials.map((material) => ({
    ...material,
    downloads: stored.get(`${material.id}\n${material.url}`) ?? 0,
  }));
}

/** The images a row points at that this API stored, relative to UPLOADS_DIR. */
function storedImages(
  row: Pick<
    ProjectRow,
    'heroImageUrl' | 'galleryImageUrls' | 'highlights' | 'materials'
  >,
) {
  const prefix = `${UPLOADS_ROUTE}/${PROJECT_IMAGES_FOLDER}/`;
  const urls = (list: Prisma.JsonValue, key: string) =>
    Array.isArray(list)
      ? list.map((entry) =>
          entry && typeof entry === 'object' && key in entry
            ? (entry as Record<string, unknown>)[key]
            : null,
        )
      : [];

  return [
    row.heroImageUrl,
    ...row.galleryImageUrls,
    ...urls(row.highlights, 'iconUrl'),
    ...urls(row.materials, 'url'),
  ]
    .filter(
      (url): url is string => typeof url === 'string' && url.startsWith(prefix),
    )
    .map((url) => url.slice(UPLOADS_ROUTE.length + 1));
}

/**
 * The Projects section (873:49133): one catalogue for the whole platform.
 *
 * Every signed-in role reads it; who may write is decided by the controller's
 * role guards, mirroring treva-broker's `projects:*` permissions.
 */
@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private async find(id: string) {
    const row = await this.prisma.project.findUnique({ where: { id } });

    if (!row) throw new NotFoundException(PROJECT_NOT_FOUND);
    return row;
  }

  /**
   * The three Live Availability numbers as the unit inventory actually has
   * them — what the section's Auto Calculate switch means.
   *
   * Blocked units are left out, the same roll-up the sync does
   * (InventorySyncService.projectFacts). The two have to agree: if they
   * disagreed, every save and every sync would overwrite each other's totals.
   */
  private async unitCounts(projectId: string) {
    const rows = await this.prisma.projectUnit.groupBy({
      by: ['status'],
      where: { projectId, status: { not: 'blocked' } },
      _count: { _all: true },
    });

    const counts = { available: 0, reserved: 0, sold: 0 };

    for (const row of rows) {
      if (row.status in counts) {
        counts[row.status as keyof typeof counts] = row._count._all;
      }
    }

    return counts;
  }

  /** The columns a save writes — shared by create and update. */
  private dataFor(dto: SaveProjectDto, current: Prisma.JsonValue = []) {
    return {
      name: dto.name,
      publicUrl: dto.publicUrl,
      heroImageUrl: dto.heroImageUrl,
      galleryImageUrls: dto.galleryImageUrls,
      highlights: dto.highlights as unknown as Prisma.InputJsonValue,
      offers: dto.offers as unknown as Prisma.InputJsonValue,
      materials: dto.materials
        ? withStoredDownloads(dto.materials, current)
        : undefined,
      developer: dto.developer,
      location: dto.location,
      status: dto.status,
      priceFrom: dto.priceFrom,
      bedroomsFrom: dto.bedroomsFrom,
      bedroomsTo: dto.bedroomsTo,
      deliveryDate:
        dto.deliveryDate === undefined
          ? undefined
          : dto.deliveryDate
            ? new Date(dto.deliveryDate)
            : null,
      ...(dto.availability
        ? {
            unitsAvailable: dto.availability.available,
            unitsReserved: dto.availability.reserved,
            unitsSold: dto.availability.sold,
            autoCalculate: dto.availability.autoCalculate,
          }
        : {}),
    } satisfies Prisma.ProjectUpdateInput;
  }

  private assertNamed(name: string | undefined): asserts name is string {
    if (!name) {
      throw new BadRequestException({
        message: 'Give the project a name',
        code: 'name_required',
      });
    }
  }

  async list(query: ProjectListQueryDto) {
    const page = query.page ?? 1;
    // 8 per page: the artboard lays cards out four-across in two rows.
    const perPage = query.perPage ?? 8;
    const search = query.search;

    const where: Prisma.ProjectWhereInput = {
      AND: [
        query.status ? { status: query.status } : {},
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { developer: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      items: rows.map((row) => toProject(row)),
      page,
      perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  async detail(id: string) {
    const row = await this.find(id);
    if (!row.externalId) return toProject(row);

    // The project screen's Floor Plan block (1173:16458) is an extract of
    // four tiles with a link out to the full floor plan.
    const units = await this.prisma.projectUnit.findMany({
      where: { projectId: id },
      select: {
        id: true,
        code: true,
        floor: true,
        position: true,
        status: true,
        bedrooms: true,
        areaSqm: true,
        loggiaSqm: true,
        priceAzn: true,
        planImageUrl: true,
      },
    });

    return toProject(row, layoutsOf(units, row.name).slice(0, 4));
  }

  async create(user: AuthUser, dto: SaveProjectDto) {
    this.assertNamed(dto.name);

    const row = await this.prisma.project.create({
      data: { ...this.dataFor(dto), name: dto.name, createdById: user.id },
    });

    return toProject(row);
  }

  async update(id: string, dto: SaveProjectDto) {
    const existing = await this.find(id);
    if (dto.name !== undefined) this.assertNamed(dto.name);

    // With Auto Calculate on the counts are the inventory's, not the form's:
    // the switch makes those inputs read-only in the editor, so what it posts
    // back is an echo of the last save. Recounting here is what makes the
    // switch mean anything — otherwise "on" just froze three stale numbers.
    const derived = dto.availability?.autoCalculate
      ? await this.unitCounts(id)
      : null;

    const counts =
      derived ??
      (dto.availability
        ? {
            available: dto.availability.available,
            reserved: dto.availability.reserved,
            sold: dto.availability.sold,
          }
        : null);

    // "Last synced" is about the counts; renaming a project does not move it.
    const countsChanged =
      !!counts &&
      (counts.available !== existing.unitsAvailable ||
        counts.reserved !== existing.unitsReserved ||
        counts.sold !== existing.unitsSold);

    const row = await this.prisma.$transaction(async (tx) => {
      // Locked like registerMaterialDownload, so a download counted while
      // the editor saves is neither lost nor overwritten.
      await tx.$queryRaw`SELECT 1 FROM "Project" WHERE id = ${id} FOR UPDATE`;
      const current = await tx.project.findUnique({
        where: { id },
        select: { materials: true },
      });

      return tx.project.update({
        where: { id },
        data: {
          ...this.dataFor(dto, current?.materials),
          ...(derived
            ? {
                unitsAvailable: derived.available,
                unitsReserved: derived.reserved,
                unitsSold: derived.sold,
              }
            : {}),
          ...(countsChanged ? { availabilitySyncedAt: new Date() } : {}),
        },
      });
    });

    // A replaced or cleared image is nobody's any more.
    const kept = new Set(storedImages(row));
    await this.unlinkAll(
      storedImages(existing).filter((path) => !kept.has(path)),
    );

    return toProject(row);
  }

  /**
   * Counts one download of a Marketing Materials file. The file itself is
   * served statically from /uploads; this only moves the number the detail
   * screen shows next to it.
   */
  async registerMaterialDownload(id: string, materialId: string) {
    return this.prisma.$transaction(async (tx) => {
      // The count lives inside a JSON column, so this is read-modify-write;
      // without the row lock two quick clicks would both write the same +1.
      await tx.$queryRaw`SELECT 1 FROM "Project" WHERE id = ${id} FOR UPDATE`;

      const row = await tx.project.findUnique({
        where: { id },
        select: { materials: true, updatedAt: true },
      });
      if (!row) throw new NotFoundException(PROJECT_NOT_FOUND);

      const materials = Array.isArray(row.materials)
        ? (row.materials as Prisma.JsonObject[])
        : [];
      const material = materials.find((entry) => entry?.id === materialId);
      if (!material) throw new NotFoundException(MATERIAL_NOT_FOUND);

      const downloads = (Number(material.downloads) || 0) + 1;
      material.downloads = downloads;

      await tx.project.update({
        where: { id },
        data: {
          materials,
          // Pinned: a download is not an edit, and `updatedAt` orders the grid.
          updatedAt: row.updatedAt,
        },
      });

      return { downloads };
    });
  }

  async remove(id: string) {
    const existing = await this.find(id);

    await this.prisma.project.delete({ where: { id } });
    await this.unlinkAll(storedImages(existing));
  }

  /**
   * Best effort, and always after the row is saved: an orphaned file is
   * untidy, a row pointing at a file that is no longer there is a broken card.
   */
  private async unlinkAll(paths: string[]) {
    await Promise.all(
      paths.map((path) => unlink(join(UPLOADS_DIR, path)).catch(() => {})),
    );
  }
}
