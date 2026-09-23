import { ConflictException, Injectable, Logger } from '@nestjs/common';
import type { Prisma, UnitStatus } from '../generated/prisma/client';
import type { AuthUser } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { ImageMirrorService } from './image-mirror.service';
import {
  TrevaApiClient,
  type TrevaHouse,
  type TrevaImage,
  type TrevaObject,
  type TrevaUnit,
} from './treva-api.client';

export interface SyncSummary {
  projects: { created: number; updated: number; deactivated: number };
  buildings: number;
  units: { created: number; updated: number; removed: number; total: number };
  durationMs: number;
}

/** A synchronised unit's row, as it is compared and written. */
type UnitData = Omit<
  Prisma.ProjectUnitUncheckedCreateInput,
  'id' | 'createdAt' | 'updatedAt' | 'syncedAt'
>;

const UNIT_FIELDS = [
  'buildingId',
  'code',
  'floor',
  'position',
  'status',
  'realEstateType',
  'bedrooms',
  'areaSqm',
  'internalAreaSqm',
  'loggiaSqm',
  'priceAzn',
  'priceUsd',
  'priceEur',
  'planImageUrl',
  'completionYear',
] as const satisfies readonly (keyof UnitData)[];

const CREATE_CHUNK = 1000;

/**
 * "C-2803" on floor 28 → 3. The code's last run of digits has to be the floor
 * number followed by exactly two digits; anything else — "Villa 11" on floor
 * 1 is villa eleven, not position one — is not a floor-and-position code and
 * answers null.
 */
function positionFromCode(code: string, floor: number) {
  const digits = /(\d+)\D*$/.exec(code)?.[1];
  const prefix = String(floor);
  if (
    !digits ||
    digits.length !== prefix.length + 2 ||
    !digits.startsWith(prefix)
  ) {
    return null;
  }

  const position = Number(digits.slice(prefix.length));
  return position > 0 ? position : null;
}

function price(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.round(value)
    : null;
}

/**
 * Copies treva-api's off-plan inventory into the broker's own database.
 *
 * treva-api's objects become projects, its houses the projects' buildings and
 * its unit layouts their units — matched on treva-api's id (`externalId`), so
 * running it again updates in place instead of duplicating. The broker reads
 * only these copies (Floor Plan, the project screens); treva-api is touched
 * nowhere but here, and only when someone presses Synchronize.
 *
 * What a sync owns and what it leaves alone on a project that already exists:
 * the name, developer, location, prices, bedroom range, delivery date and unit
 * counts come from treva-api every time; the cover image only when the project
 * has none; the editor's own content — highlights, offers, gallery, public URL
 * and the active/inactive switch — is never touched.
 */
@Injectable()
export class InventorySyncService {
  private readonly logger = new Logger(InventorySyncService.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly treva: TrevaApiClient,
    private readonly imageMirror: ImageMirrorService,
  ) {}

  /** treva-api stores its own uploads root-relative. */
  private absolute(url: string | null | undefined) {
    if (!url) return null;
    return url.startsWith('/') ? `${this.treva.origin}${url}` : url;
  }

  private image(image: TrevaImage | null | undefined) {
    return this.absolute(image?.url);
  }

  /**
   * The stored copy of a URL, or the remote address when mirroring it did not
   * work out — a drawing served slowly is still better than none.
   */
  private stored(mirrored: Map<string, string>, url: string | null) {
    if (!url) return null;
    return mirrored.get(url) ?? url;
  }

  private local(
    mirrored: Map<string, string>,
    image: TrevaImage | null | undefined,
  ) {
    return this.stored(mirrored, this.image(image));
  }

  async sync(user: AuthUser): Promise<SyncSummary> {
    if (this.running) {
      throw new ConflictException({
        message: 'A synchronisation is already running',
        code: 'sync_in_progress',
      });
    }

    this.running = true;
    const started = Date.now();

    try {
      const summary: SyncSummary = {
        projects: { created: 0, updated: 0, deactivated: 0 },
        buildings: 0,
        units: { created: 0, updated: 0, removed: 0, total: 0 },
        durationMs: 0,
      };

      const objects = await this.treva.objects();

      for (const object of objects) {
        // Fetched before the transaction opens: network time must not hold
        // a database transaction open.
        const [houses, units] = await Promise.all([
          this.treva.houses(object.id),
          this.treva.units(object.id),
        ]);

        await this.syncObject(user, object, houses, units, summary);
      }

      // An object gone from treva-api is off sale, not deleted: the broker's
      // own content on it stays, it just stops showing as active.
      const deactivated = await this.prisma.project.updateMany({
        where: {
          externalId: { not: null, notIn: objects.map((object) => object.id) },
          status: 'active',
        },
        data: { status: 'inactive' },
      });
      summary.projects.deactivated = deactivated.count;

      summary.durationMs = Date.now() - started;
      this.logger.log(
        `Synchronised ${objects.length} objects, ${summary.units.total} units in ${summary.durationMs}ms`,
      );
      return summary;
    } finally {
      this.running = false;
    }
  }

  private async syncObject(
    user: AuthUser,
    object: TrevaObject,
    houses: TrevaHouse[],
    units: TrevaUnit[],
    summary: SyncSummary,
  ) {
    const now = new Date();

    // Before the transaction, never inside it: this downloads every drawing
    // and photo the object points at, which is minutes of network on a first
    // sync and would hold a write transaction open for all of it.
    const mirrored = await this.imageMirror.mirrorAll(
      [
        this.absolute(object.coverImage ?? object.bannerImage ?? object.image),
        ...houses.map((house) => this.image(house.mainImage)),
        ...units.map((unit) => this.image(unit.mainImage)),
      ].filter((url): url is string => Boolean(url)),
    );

    await this.prisma.$transaction(
      async (tx) => {
        const existing = await tx.project.findUnique({
          where: { externalId: object.id },
          select: { id: true, heroImageUrl: true },
        });

        const project = existing
          ? await tx.project.update({
              where: { id: existing.id },
              data: { name: object.title, syncedAt: now },
              select: { id: true },
            })
          : await tx.project.create({
              data: {
                name: object.title,
                externalId: object.id,
                syncedAt: now,
                createdById: user.id,
              },
              select: { id: true },
            });

        if (existing) summary.projects.updated += 1;
        else summary.projects.created += 1;

        // ---- Buildings ---------------------------------------------------
        const buildingIds = new Map<string, string>();

        for (const house of houses) {
          const data = {
            projectId: project.id,
            name: house.title,
            imageUrl: this.local(mirrored, house.mainImage),
            floorsFrom: house.numberOfFloors?.start ?? 1,
            floorsTo: house.numberOfFloors?.end ?? 1,
            completionYear: house.completionYear ?? null,
            syncedAt: now,
          };

          const building = await tx.projectBuilding.upsert({
            where: { externalId: house.id },
            create: { ...data, externalId: house.id },
            update: data,
            select: { id: true },
          });
          buildingIds.set(house.id, building.id);
        }

        // A unit treva-api has not filed under a house still needs a building
        // to sit in on the stacking plan.
        const orphanKey = `${object.id}:unassigned`;
        const needsOrphan = units.some(
          (unit) => !unit.houseId || !buildingIds.has(unit.houseId),
        );
        if (needsOrphan) {
          const building = await tx.projectBuilding.upsert({
            where: { externalId: orphanKey },
            create: {
              projectId: project.id,
              externalId: orphanKey,
              name: object.title,
              syncedAt: now,
            },
            update: { syncedAt: now },
            select: { id: true },
          });
          buildingIds.set(orphanKey, building.id);
        }

        summary.buildings += buildingIds.size;

        // ---- Units -------------------------------------------------------
        const rows = this.unitRows(
          project.id,
          units,
          buildingIds,
          orphanKey,
          mirrored,
        );

        const current = await tx.projectUnit.findMany({
          where: { projectId: project.id },
          select: {
            id: true,
            externalId: true,
            ...Object.fromEntries(UNIT_FIELDS.map((field) => [field, true])),
          },
        });
        const byExternalId = new Map(
          current.map((row) => [row.externalId, row]),
        );

        const toCreate: (UnitData & { syncedAt: Date })[] = [];

        for (const row of rows) {
          const found = byExternalId.get(row.externalId);

          if (!found) {
            toCreate.push({ ...row, syncedAt: now });
            continue;
          }

          const changed = UNIT_FIELDS.some(
            (field) => (found as Record<string, unknown>)[field] !== row[field],
          );
          if (changed) {
            await tx.projectUnit.update({
              where: { id: found.id },
              data: { ...row, syncedAt: now },
            });
            summary.units.updated += 1;
          }
        }

        for (let index = 0; index < toCreate.length; index += CREATE_CHUNK) {
          await tx.projectUnit.createMany({
            data: toCreate.slice(index, index + CREATE_CHUNK),
          });
        }
        summary.units.created += toCreate.length;

        const removed = await tx.projectUnit.deleteMany({
          where: {
            projectId: project.id,
            externalId: { notIn: rows.map((row) => row.externalId) },
          },
        });
        summary.units.removed += removed.count;

        await tx.projectBuilding.deleteMany({
          where: {
            projectId: project.id,
            externalId: {
              notIn: [...buildingIds.keys()],
            },
          },
        });

        summary.units.total += rows.length;

        // ---- Project roll-up ----------------------------------------------
        await tx.project.update({
          where: { id: project.id },
          data: {
            ...this.projectFacts(object, rows),
            // Only a project without a cover of its own gets one; a picture the
            // editor chose is the broker's, not treva-api's. The editor only
            // ever uploads, so a remote cover is one an earlier sync wrote
            // before images were mirrored, and is replaced with the copy.
            ...(existing?.heroImageUrl && !/^https?:/.test(existing.heroImageUrl)
              ? {}
              : {
                  heroImageUrl:
                    this.stored(
                      mirrored,
                      this.absolute(
                        object.coverImage ?? object.bannerImage ?? object.image,
                      ),
                    ) ??
                    houses
                      .map((house) => this.local(mirrored, house.mainImage))
                      .find(Boolean) ??
                    null,
                }),
          },
        });
      },
      // A first sync of a large object writes a few thousand rows.
      { timeout: 5 * 60_000, maxWait: 30_000 },
    );
  }

  private unitRows(
    projectId: string,
    units: TrevaUnit[],
    buildingIds: Map<string, string>,
    orphanKey: string,
    mirrored: Map<string, string>,
  ): (UnitData & { externalId: string })[] {
    const rows = units.map((unit) => {
      const buildingId =
        (unit.houseId && buildingIds.get(unit.houseId)) ||
        buildingIds.get(orphanKey)!;

      const status: UnitStatus = unit.archived
        ? 'blocked'
        : unit.status === 'reserved' || unit.status === 'sold'
          ? unit.status
          : 'available';

      return {
        projectId,
        buildingId,
        externalId: unit.id,
        code: unit.unitCode || unit.title.split('·').pop()?.trim() || unit.id,
        floor: unit.floor,
        // Filled in below: treva-api's `number` is the room count, not where
        // the unit sits on its floor.
        position: 0,
        status,
        realEstateType: unit.realEstateType ?? '',
        bedrooms: unit.rooms ?? unit.number ?? 0,
        areaSqm: unit.totalArea ?? 0,
        internalAreaSqm: unit.internalArea ?? null,
        loggiaSqm: unit.balconyArea ?? 0,
        priceAzn: price(unit.prices?.AZN),
        priceUsd: price(unit.prices?.USD),
        priceEur: price(unit.prices?.EUR),
        planImageUrl: this.local(mirrored, unit.mainImage),
        completionYear: unit.completionYear ?? null,
      };
    });

    // The position is read off the unit code, which carries the floor followed
    // by the place on it: C-2803 is floor 28, position 03. Units whose code
    // does not follow that pattern (villas, parking, retail) take the next
    // free slot on their floor in code order, so every unit still lands in a
    // column of the stacking plan without two sharing one.
    const byFloor = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = `${row.buildingId}:${row.floor}`;
      byFloor.set(key, [...(byFloor.get(key) ?? []), row]);
    }

    for (const floor of byFloor.values()) {
      const taken = new Set<number>();

      for (const row of floor) {
        const position = positionFromCode(row.code, row.floor);
        if (position && !taken.has(position)) {
          row.position = position;
          taken.add(position);
        }
      }

      let next = 0;
      floor
        .filter((row) => row.position <= 0)
        .sort((a, b) => a.code.localeCompare(b.code, 'en', { numeric: true }))
        .forEach((row) => {
          do next += 1;
          while (taken.has(next));
          row.position = next;
          taken.add(next);
        });
    }

    return rows;
  }

  /** The project-level facts a sync owns, rolled up from its units. */
  private projectFacts(
    object: TrevaObject,
    rows: UnitData[],
  ): Prisma.ProjectUpdateInput {
    const live = rows.filter((row) => row.status !== 'blocked');
    const count = (status: UnitStatus) =>
      live.filter((row) => row.status === status).length;

    const prices = (candidates: UnitData[]) =>
      candidates
        .map((row) => row.priceAzn)
        .filter(
          (value): value is number => typeof value === 'number' && value > 0,
        );
    const available = prices(live.filter((row) => row.status === 'available'));
    const anyPrice = available.length ? available : prices(live);

    const bedrooms = live
      .map((row) => row.bedrooms ?? 0)
      .filter((value) => value > 0);
    const year = Math.max(0, ...rows.map((row) => row.completionYear ?? 0));

    const location = [
      object.locationTitle,
      object.area,
      object.region,
      object.city,
    ]
      .map((part) => part?.trim())
      .filter(
        (part, index, all): part is string =>
          Boolean(part) && all.indexOf(part) === index,
      )
      .join(', ');

    return {
      developer: object.developerBrand?.trim() ?? '',
      location,
      priceFrom: anyPrice.length ? Math.min(...anyPrice) : 0,
      bedroomsFrom: bedrooms.length ? Math.min(...bedrooms) : 0,
      bedroomsTo: bedrooms.length ? Math.max(...bedrooms) : 0,
      deliveryDate: year ? new Date(Date.UTC(year, 11, 31)) : null,
      unitsAvailable: count('available'),
      unitsReserved: count('reserved'),
      unitsSold: count('sold'),
      autoCalculate: true,
      availabilitySyncedAt: new Date(),
    };
  }
}
