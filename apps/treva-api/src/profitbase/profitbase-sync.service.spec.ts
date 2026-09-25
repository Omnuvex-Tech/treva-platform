import { ProfitbaseSyncService } from './profitbase-sync.service';
import type {
  ProfitbaseClientService,
  ProfitbaseHouse,
  ProfitbaseProperty,
} from './profitbase-client.service';
import type { ProfitbaseImageService } from './profitbase-image.service';
import type { PrismaService } from '../prisma/prisma.service';

type Row = Record<string, any>;

/** Just enough of Prisma for the sync: rows keyed by id, looked up by externalId. */
function fakeTable(prefix: string) {
  const rows = new Map<string, Row>();
  let seq = 0;
  return {
    rows,
    findUnique: ({ where }: { where: Row }) =>
      Promise.resolve(
        [...rows.values()].find((row) =>
          Object.entries(where).every(([key, value]) => row[key] === value),
        ) ?? null,
      ),
    create: ({ data }: { data: Row }) => {
      const row = { id: `${prefix}${++seq}`, ...data };
      rows.set(row.id, row);
      return Promise.resolve(row);
    },
    update: ({ where, data }: { where: { id: string }; data: Row }) => {
      const row = { ...rows.get(where.id)!, ...data };
      rows.set(where.id, row);
      return Promise.resolve(row);
    },
    count: () => Promise.resolve(0),
  };
}

function setup(
  existing: {
    category?: Row;
    house?: Row;
    unit?: Row;
    deletions?: { entity: string; externalId: string }[];
  } = {},
) {
  const category = fakeTable('cat');
  const house = fakeTable('house');
  const unitLayout = fakeTable('unit');
  for (const [table, row] of [
    [category, existing.category],
    [house, existing.house],
    [unitLayout, existing.unit],
  ] as const) {
    if (row) table.rows.set(row.id, row);
  }

  const prisma = {
    category,
    house,
    unitLayout,
    unitTypeOption: {
      findMany: () => Promise.resolve([]),
      upsert: ({ create }: { create: Row }) =>
        Promise.resolve({ id: `type-${create.name}`, ...create }),
    },
    profitbaseDeletion: {
      findMany: () => Promise.resolve(existing.deletions ?? []),
    },
  } as unknown as PrismaService;

  const pbHouse = (id: number): ProfitbaseHouse => ({
    id,
    projectId: 1,
    projectName: 'Sea Breeze',
    title: `Tower ${id}`,
    type: 'RESIDENTIAL',
    isArchive: false,
    buildingState: 'UNFINISHED',
    facing: null,
    street: null,
    number: null,
    minFloor: 1,
    maxFloor: 20,
    commissioningDate: null,
    developmentEndQuarter: { year: '2028', quarter: 4 },
    currency: { code: 'USD' },
    address: null,
    contractAddress: null,
    minPrice: 100000,
    minPriceArea: null,
    image: null,
    fullImage: null,
  });
  const pbProperty = (id: number, houseId: number): ProfitbaseProperty =>
    ({
      id,
      house_id: houseId,
      houseName: `Tower ${houseId}`,
      projectId: 1,
      projectName: 'Sea Breeze',
      number: `A-${id}`,
      rooms_amount: 2,
      studio: false,
      floor: 5,
      sectionName: 'A',
      propertyType: 'apartment',
      typePurpose: 'residential',
      area: { area_total: 80, area_living: 70, area_balcony: null },
      price: { value: 200000 },
      status: 'AVAILABLE',
      custom_fields: [],
    }) as unknown as ProfitbaseProperty;

  const client = {
    getProjects: () =>
      Promise.resolve([
        {
          id: 1,
          title: 'Sea Breeze',
          archiveState: 'NOT_ARCHIVED',
          locality: null,
          developer_brand: null,
          currency: 'USD',
          location: null,
          images: null,
        },
      ]),
    getHouses: () => Promise.resolve([pbHouse(10), pbHouse(11)]),
    getPlans: () => Promise.resolve([]),
    getProperties: () =>
      Promise.resolve([pbProperty(100, 10), pbProperty(101, 11)]),
  } as unknown as ProfitbaseClientService;

  const images = {
    mirrorAll: () => Promise.resolve(new Map<string, string>()),
  } as unknown as ProfitbaseImageService;

  return {
    service: new ProfitbaseSyncService(prisma, client, images),
    category,
    house,
    unitLayout,
  };
}

const edited = new Date('2026-09-25T10:00:00Z');

describe('ProfitbaseSyncService', () => {
  it('imports new objects, houses and units', async () => {
    const { service, category, house, unitLayout } = setup();

    const summary = await service.sync();

    expect(summary.categories).toEqual({ created: 1, updated: 0, skipped: 0 });
    expect(summary.houses).toEqual({ created: 2, updated: 0, skipped: 0 });
    expect(summary.unitLayouts).toEqual({ created: 2, updated: 0, skipped: 0 });
    expect(category.rows.size).toBe(1);
    expect(house.rows.size).toBe(2);
    expect(unitLayout.rows.size).toBe(2);
  });

  it('overwrites records nobody has edited', async () => {
    const { service, unitLayout } = setup({
      category: { id: 'c1', externalId: '1', title: 'Old', image: null },
      unit: { id: 'u1', externalId: '100', title: 'Kept title', floor: 1 },
    });

    const summary = await service.sync();

    expect(summary.unitLayouts.updated).toBe(1);
    expect(unitLayout.rows.get('u1')).toMatchObject({
      floor: 5,
      title: 'Kept title',
    });
  });

  it('leaves records edited in the inventory untouched', async () => {
    const category = {
      id: 'c1',
      externalId: '1',
      title: 'Renamed in inventory',
      editedInInventoryAt: edited,
    };
    const house = {
      id: 'h1',
      externalId: '10',
      title: 'Edited tower',
      completionYear: 2031,
      editedInInventoryAt: edited,
    };
    const unit = {
      id: 'u1',
      externalId: '100',
      floor: 9,
      prices: { USD: 1 },
      editedInInventoryAt: edited,
    };
    const ctx = setup({ category, house, unit });

    const summary = await ctx.service.sync();

    // Only the derived house/unit counts are recalculated on the object.
    expect(ctx.category.rows.get('c1')).toEqual({
      ...category,
      housesCount: 0,
      propertiesCount: 0,
      reservedCount: 0,
      soldCount: 0,
    });
    expect(ctx.house.rows.get('h1')).toEqual(house);
    expect(ctx.unitLayout.rows.get('u1')).toEqual(unit);
    expect(summary.categories.skipped).toBe(1);
    expect(summary.houses.skipped).toBe(1);
    expect(summary.unitLayouts.skipped).toBe(1);
    // The other house and its unit are still imported under the edited object.
    expect(summary.houses.created).toBe(1);
    expect(summary.unitLayouts.created).toBe(1);
  });

  it('does not re-create records deleted in the inventory', async () => {
    const { service, house, unitLayout } = setup({
      deletions: [
        { entity: 'house', externalId: '10' },
        { entity: 'unitLayout', externalId: '101' },
      ],
    });

    const summary = await service.sync();

    // House 10 and its unit 100 are gone, and so is unit 101.
    expect([...house.rows.values()].map((row) => row.externalId)).toEqual([
      '11',
    ]);
    expect(unitLayout.rows.size).toBe(0);
    expect(summary.houses.skipped).toBe(1);
    expect(summary.unitLayouts.skipped).toBe(2);
  });

  it('imports nothing under a deleted object', async () => {
    const { service, category, house, unitLayout } = setup({
      deletions: [{ entity: 'category', externalId: '1' }],
    });

    const summary = await service.sync();

    expect(category.rows.size + house.rows.size + unitLayout.rows.size).toBe(0);
    expect(summary.categories.skipped).toBe(1);
  });
});
