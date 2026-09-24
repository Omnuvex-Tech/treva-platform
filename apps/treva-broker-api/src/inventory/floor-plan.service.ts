import { Injectable, NotFoundException } from '@nestjs/common';
import type { ProjectUnit, UnitStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { LayoutListQueryDto, LayoutSortValue } from './dto/floor-plan.dto';

const BUILDING_NOT_FOUND = {
  message: 'Building not found',
  code: 'not_found',
} as const;

const STATUSES: UnitStatus[] = ['available', 'reserved', 'sold', 'blocked'];

type LayoutRow = ReturnType<typeof layoutsOf>[number];

/** The Layouts tab's sort control, applied before the page is cut. */
const LAYOUT_ORDER: Record<
  LayoutSortValue,
  (a: LayoutRow, b: LayoutRow) => number
> = {
  lowestPrice: (a, b) => a.priceFrom - b.priceFrom || a.areaSqm - b.areaSqm,
  highestPrice: (a, b) => b.priceFrom - a.priceFrom || a.areaSqm - b.areaSqm,
  largestArea: (a, b) => b.areaSqm - a.areaSqm || a.priceFrom - b.priceFrom,
};

type UnitRow = Pick<
  ProjectUnit,
  | 'id'
  | 'code'
  | 'floor'
  | 'position'
  | 'status'
  | 'bedrooms'
  | 'areaSqm'
  | 'loggiaSqm'
  | 'priceAzn'
  | 'planImageUrl'
>;

/** treva-broker's `Unit` (apps/treva-broker/src/features/floor-plan/types.ts). */
function toUnit(row: UnitRow) {
  return {
    id: row.id,
    code: row.code,
    position: row.position,
    floor: row.floor,
    status: row.status,
    bedrooms: row.bedrooms,
    areaSqm: row.areaSqm,
    loggiaSqm: row.loggiaSqm,
    price: row.priceAzn ?? 0,
    planImageUrl: row.planImageUrl,
  };
}

/**
 * Units grouped into layouts — treva-broker's `Layout`.
 *
 * Grouped by room count and area, not by drawing: Profitbase serves every unit
 * its own copy of the plan image, so no two units ever share a URL even when
 * they share a floor plan. The first unit's drawing represents the group.
 */
export function layoutsOf(
  units: UnitRow[],
  label: string,
): {
  id: string;
  label: string;
  priceFrom: number;
  areaSqm: number;
  propertyCount: number;
  planImageUrl: string | null;
}[] {
  const groups = new Map<string, UnitRow[]>();

  for (const unit of units) {
    if (unit.status === 'blocked') continue;
    const key = `${unit.bedrooms}|${unit.areaSqm.toFixed(1)}`;
    groups.set(key, [...(groups.get(key) ?? []), unit]);
  }

  return [...groups.values()]
    .map((group) => {
      const priced = group
        .map((unit) => unit.priceAzn)
        .filter((value): value is number => Boolean(value && value > 0));

      return {
        id: group[0].id,
        label,
        priceFrom: priced.length ? Math.min(...priced) : 0,
        areaSqm: Math.min(...group.map((unit) => unit.areaSqm)),
        propertyCount: group.length,
        planImageUrl: group[0].planImageUrl,
      };
    })
    .sort((a, b) => a.priceFrom - b.priceFrom || a.areaSqm - b.areaSqm);
}

/**
 * Floor Plan, read from the broker's own copy of the inventory — the rows
 * `InventorySyncService` writes. treva-api is never called from here.
 */
@Injectable()
export class FloorPlanService {
  constructor(private readonly prisma: PrismaService) {}

  /** treva-broker's `BuildingSummary[]` — the Listings screen (886:15740). */
  async buildings() {
    const [buildings, totals, prices, floors] = await Promise.all([
      this.prisma.projectBuilding.findMany({
        // A building whose every unit is blocked (a parking block) has
        // nothing to sell and no card on Listings.
        where: { units: { some: { status: { not: 'blocked' } } } },
        include: { project: { select: { name: true } } },
        orderBy: [{ project: { name: 'asc' } }, { name: 'asc' }],
      }),
      this.prisma.projectUnit.groupBy({
        by: ['buildingId'],
        where: { status: { not: 'blocked' } },
        _count: { _all: true },
      }),
      this.prisma.projectUnit.groupBy({
        by: ['buildingId'],
        where: { status: 'available', priceAzn: { gt: 0 } },
        _min: { priceAzn: true },
      }),
      this.prisma.projectUnit.groupBy({
        by: ['buildingId', 'floor'],
      }),
    ]);

    const total = new Map(
      totals.map((row) => [row.buildingId, row._count._all]),
    );
    const from = new Map(
      prices.map((row) => [row.buildingId, row._min.priceAzn]),
    );
    const floorCount = new Map<string, number>();
    for (const row of floors) {
      floorCount.set(row.buildingId, (floorCount.get(row.buildingId) ?? 0) + 1);
    }

    return buildings.map((building) => ({
      id: building.id,
      name: building.name,
      projectId: building.projectId,
      projectName: building.project.name,
      floors: floorCount.get(building.id) ?? 0,
      unitsTotal: total.get(building.id) ?? 0,
      priceFrom: from.get(building.id) ?? 0,
      imageUrl: building.imageUrl,
    }));
  }

  /**
   * treva-broker's `Building`: floors top-down, each floor's units in position
   * order and the four status counts. Its layouts are paged separately.
   */
  async building(id: string) {
    const building = await this.prisma.projectBuilding.findUnique({
      where: { id },
      include: {
        project: { select: { name: true } },
        units: {
          orderBy: [{ floor: 'desc' }, { position: 'asc' }, { code: 'asc' }],
        },
      },
    });

    if (!building) throw new NotFoundException(BUILDING_NOT_FOUND);

    const floors = new Map<number, ReturnType<typeof toUnit>[]>();
    for (const unit of building.units) {
      floors.set(unit.floor, [...(floors.get(unit.floor) ?? []), toUnit(unit)]);
    }

    const counts = Object.fromEntries(
      STATUSES.map((status) => [
        status,
        building.units.filter((unit) => unit.status === status).length,
      ]),
    ) as Record<UnitStatus, number>;

    return {
      id: building.id,
      name: building.name,
      projectName: building.project.name,
      floors: [...floors.entries()].map(([level, units]) => ({
        level,
        label: `F${level}`,
        units,
      })),
      counts,
    };
  }

  /**
   * The Layouts tab, 20 to a page by default: the building's units grouped by
   * the plan they share, sorted, then cut. Grouping happens in memory — a
   * building holds a few hundred units at most — so the page is taken from
   * the sorted groups rather than from the units.
   */
  async layouts(id: string, query: LayoutListQueryDto) {
    const building = await this.prisma.projectBuilding.findUnique({
      where: { id },
      select: {
        name: true,
        project: { select: { name: true } },
        units: {
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
          orderBy: [{ floor: 'desc' }, { position: 'asc' }, { code: 'asc' }],
        },
      },
    });

    if (!building) throw new NotFoundException(BUILDING_NOT_FOUND);

    const label =
      building.name === building.project.name
        ? building.name
        : `${building.project.name}, ${building.name}`;
    const sorted = layoutsOf(building.units, label).sort(
      LAYOUT_ORDER[query.sort ?? 'lowestPrice'],
    );

    const perPage = query.perPage ?? 20;
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(query.page ?? 1, totalPages);

    return {
      items: sorted.slice((page - 1) * perPage, page * perPage),
      page,
      perPage,
      total,
      totalPages,
    };
  }
}
