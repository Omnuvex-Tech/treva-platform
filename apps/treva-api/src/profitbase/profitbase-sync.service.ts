import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { pricesInAllCurrencies } from '../unit-layouts/currency-prices';
import {
  ProfitbaseClientService,
  ProfitbaseHouse,
  ProfitbasePlan,
  ProfitbaseProject,
  ProfitbaseProperty,
} from './profitbase-client.service';
import { ProfitbaseImageService } from './profitbase-image.service';
import {
  CUSTOM_FIELD,
  constructionStageFromHouse,
  constructionStageFromUnit,
  customFieldNumber,
  customFieldValue,
  isParking,
  realEstateTypeLabel,
  typeOfBuildingLabel,
  unitFinishing,
  unitTypeFor,
} from './profitbase-mappers';

/**
 * Profitbase feeds the panel until the panel takes over. A Transfer creates
 * the objects, houses and units it has not seen and overwrites the fields it
 * knows on the ones it created - until someone changes a record in the panel
 * (`editedInInventoryAt`), after which the Transfer never writes to it again.
 * Records deleted in the panel are not re-created (`ProfitbaseDeletion`), nor
 * are new units of a deleted house or anything under a deleted object.
 *
 * The panel owns what Profitbase has no notion of - slugs, SEO, descriptions,
 * attributes, brochures - and the house fields Profitbase leaves empty on our
 * account (street, sales office, deadline when there is no handover
 * quarter...), which the sync only fills when Profitbase has a value.
 *
 * One site policy sits on top: parkings are not sold through the site, so
 * parking units and parking houses are always archived. Units of a house
 * archived in Profitbase are archived with it.
 */

interface SyncCounters {
  created: number;
  updated: number;
  // Edited or deleted in the panel, so left alone.
  skipped: number;
}

interface DeletedIds {
  category: Set<string>;
  house: Set<string>;
  unitLayout: Set<string>;
}

export interface ProfitbaseSyncSummary {
  categories: SyncCounters;
  houses: SyncCounters;
  unitLayouts: SyncCounters;
}

interface SyncedHouse {
  id: string;
  completionYear: number;
}

const STATUS_MAP: Record<string, { status: string; archived: boolean }> = {
  AVAILABLE: { status: 'available', archived: false },
  SOLD: { status: 'sold', archived: false },
  BOOKED: { status: 'reserved', archived: false },
  UNAVAILABLE: { status: 'available', archived: true },
};

@Injectable()
export class ProfitbaseSyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly client: ProfitbaseClientService,
    private readonly images: ProfitbaseImageService,
  ) {}

  /** The copy of an upstream picture, or its own URL when copying failed. */
  private stored(
    mirrored: Map<string, string>,
    url: string | null | undefined,
  ): string | undefined {
    if (!url) return undefined;
    return mirrored.get(url) ?? url;
  }

  private slugify(value: string): string {
    const slug = value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return slug || 'item';
  }

  private parseNumber(value: string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private parseYear(value: string | null): number | null {
    if (!value) return null;
    const match = /\d{4}/.exec(value);
    return match ? Number(match[0]) : null;
  }

  /**
   * Handover year (and, when known, the last day of the handover quarter as
   * an ISO date) for a house. `commissioningDate` is null on our account, so
   * `developmentEndQuarter` is the real source; null means Profitbase has no
   * date and the stored value must be left alone rather than guessed.
   */
  private parseHandover(
    house: ProfitbaseHouse,
  ): { year: number; deadline?: string } | null {
    const endQuarter = house.developmentEndQuarter;
    const year = Number(endQuarter?.year);
    if (
      endQuarter &&
      Number.isInteger(year) &&
      endQuarter.quarter >= 1 &&
      endQuarter.quarter <= 4
    ) {
      // Day 0 of the month after the quarter is the quarter's last day.
      const deadline = new Date(Date.UTC(year, endQuarter.quarter * 3, 0))
        .toISOString()
        .slice(0, 10);
      return { year, deadline };
    }
    const commissioningYear = this.parseYear(house.commissioningDate);
    return commissioningYear ? { year: commissioningYear } : null;
  }

  async sync(): Promise<ProfitbaseSyncSummary> {
    const [projects, houses, plans, properties] = await Promise.all([
      this.client.getProjects(),
      this.client.getHouses(),
      this.client.getPlans(),
      this.client.getProperties(),
    ]);

    const summary: ProfitbaseSyncSummary = {
      categories: { created: 0, updated: 0, skipped: 0 },
      houses: { created: 0, updated: 0, skipped: 0 },
      unitLayouts: { created: 0, updated: 0, skipped: 0 },
    };
    const deleted = await this.loadDeletedIds();

    // Every picture this run will reference, copied before anything is written.
    // Done in one pass rather than per row so the downloads can run in
    // parallel, and so a row is only ever written with an address this API can
    // serve itself.
    const mirrored = await this.images.mirrorAll(
      [
        ...houses.map((house) => house.fullImage || house.image),
        ...plans.flatMap((plan) => [
          plan.image?.source,
          ...(plan.planImages ?? []).map((img) => img.big || img.source),
        ]),
      ].filter((url): url is string => Boolean(url)),
    );

    const projectById = new Map<number, ProfitbaseProject>();
    for (const project of projects) projectById.set(project.id, project);

    const propertyById = new Map<string, ProfitbaseProperty>();
    for (const property of properties) {
      propertyById.set(String(property.id), property);
    }

    // Only projects that actually have houses or units become objects; the
    // project list also holds empty and duplicate projects.
    const projectNameById = new Map<number, string>();
    for (const house of houses)
      projectNameById.set(house.projectId, house.projectName);
    for (const plan of plans) {
      if (!projectNameById.has(plan.projectId)) {
        projectNameById.set(plan.projectId, plan.projectName);
      }
    }
    for (const property of properties) {
      if (!projectNameById.has(property.projectId)) {
        projectNameById.set(property.projectId, property.projectName);
      }
    }

    const categoryIdByProjectId = new Map<number, string>();
    for (const [projectId, projectName] of projectNameById) {
      const categoryId = await this.upsertCategory(
        projectId,
        projectName,
        projectById.get(projectId) ?? null,
        deleted,
        summary,
      );
      if (categoryId) categoryIdByProjectId.set(projectId, categoryId);
    }

    const houseById = new Map<number, ProfitbaseHouse>();
    const syncedHouseByExternalId = new Map<number, SyncedHouse>();
    for (const house of houses) {
      houseById.set(house.id, house);
      const categoryId = categoryIdByProjectId.get(house.projectId);
      if (!categoryId) continue;
      const syncedHouse = await this.upsertHouse(
        house,
        categoryId,
        deleted,
        summary,
        mirrored,
      );
      if (syncedHouse) syncedHouseByExternalId.set(house.id, syncedHouse);
    }

    const touchedCategoryIds = new Set<string>(categoryIdByProjectId.values());
    const unitTypeIds = await this.loadUnitTypeIds();

    // The layout data (areas, prices, plan images) comes from `plan`.
    // `property` resolves the house/category link plus the per-unit fields a
    // plan does not carry: unit number, floor, entrance, status, finishing.
    const syncUnit = async (
      plan: ProfitbasePlan | null,
      property: ProfitbaseProperty,
    ) => {
      const categoryId = categoryIdByProjectId.get(property.projectId);
      if (!categoryId) return;
      await this.upsertUnitLayout(
        plan,
        property,
        categoryId,
        syncedHouseByExternalId.get(property.house_id) ?? null,
        houseById.get(property.house_id) ?? null,
        unitTypeIds,
        deleted,
        summary,
        mirrored,
      );
    };

    const syncedPropertyIds = new Set<string>();

    for (const plan of plans) {
      for (const propertyId of plan.properties ?? []) {
        const property = propertyById.get(String(propertyId));
        // A plan without its property carries no unit number, floor or
        // status, so there is nothing to key a unit layout on.
        if (!property) continue;
        syncedPropertyIds.add(String(property.id));
        await syncUnit(plan, property);
      }
    }

    // Profitbase has no plan for some properties (sold units, and all of
    // Sabah Towers' Tower 2 at the time of writing); without this pass they
    // would drop out of the catalogue.
    for (const property of properties) {
      if (syncedPropertyIds.has(String(property.id))) continue;
      await syncUnit(null, property);
    }

    for (const categoryId of touchedCategoryIds) {
      await this.syncCategoryMetrics(categoryId);
    }

    return summary;
  }

  private async upsertCategory(
    projectId: number,
    projectName: string,
    project: ProfitbaseProject | null,
    deleted: DeletedIds,
    summary: ProfitbaseSyncSummary,
  ): Promise<string | null> {
    const externalId = String(projectId);
    const projectImage = project?.images?.[0]?.url;
    const sharedData = {
      title: projectName,
      name: projectName,
      ...(project
        ? {
            // An archived project comes off the site; a partially archived
            // one still has houses on sale.
            status: project.archiveState === 'ARCHIVED' ? 'archive' : 'active',
            ...(project.currency ? { currency: project.currency } : {}),
            ...(project.developer_brand
              ? { developerBrand: project.developer_brand }
              : {}),
          }
        : {}),
    };

    const existing = await this.prisma.category.findUnique({
      where: { externalId },
    });

    if (existing?.editedInInventoryAt) {
      summary.categories.skipped++;
      return existing.id;
    }

    if (existing) {
      await this.prisma.category.update({
        where: { id: existing.id },
        data: {
          ...sharedData,
          // Object images are uploaded in the panel; Profitbase has one for a
          // single project, so it only fills a missing image.
          ...(!existing.image && projectImage ? { image: projectImage } : {}),
        },
      });
      summary.categories.updated++;
      return existing.id;
    }

    if (deleted.category.has(externalId)) {
      summary.categories.skipped++;
      return null;
    }

    const slug = `${this.slugify(projectName)}-${projectId}`;
    const created = await this.prisma.category.create({
      data: {
        ...sharedData,
        ...(projectImage ? { image: projectImage } : {}),
        slug,
        type: 'object',
        externalId,
      },
    });
    summary.categories.created++;
    return created.id;
  }

  private async upsertHouse(
    house: ProfitbaseHouse,
    categoryId: string,
    deleted: DeletedIds,
    summary: ProfitbaseSyncSummary,
    mirrored: Map<string, string>,
  ): Promise<SyncedHouse | null> {
    const externalId = String(house.id);
    const title = house.title || house.projectName;
    const minFloor = house.minFloor ?? 1;
    const maxFloor = Math.max(house.maxFloor ?? minFloor, minFloor);
    const handover = this.parseHandover(house);
    const currencyCode = house.currency?.code || 'USD';
    const imageUrl = this.stored(mirrored, house.fullImage || house.image);
    const constructionStage = constructionStageFromHouse(house);

    const sharedData = {
      title,
      name: title,
      categoryId,
      floor: minFloor,
      // Profitbase has no house-level area (`minPriceArea` is a price per m²).
      totalArea: 0,
      internalArea: 0,
      prices: house.minPrice ? { [currencyCode]: house.minPrice } : {},
      numberOfFloors: { start: minFloor, end: maxFloor },
      typeOfBuilding: typeOfBuildingLabel(house.type),
      archived: (house.isArchive ?? false) || house.type === 'PARKING',
      mainImage: imageUrl
        ? { url: imageUrl, alt: house.title || undefined }
        : undefined,
      // Profitbase leaves these empty for most houses, and the panel may fill
      // them in, so they are only written when Profitbase has a value.
      ...(handover
        ? {
            completionYear: handover.year,
            deadlineForCommissioning: handover.deadline,
          }
        : {}),
      ...(constructionStage ? { constructionStage } : {}),
      locationTitle: house.address?.full || undefined,
      street: house.street || house.address?.street || undefined,
      houseNumber: house.number || house.address?.number || undefined,
      contractAddress: house.contractAddress || undefined,
    };

    const existing = await this.prisma.house.findUnique({
      where: { externalId },
    });

    if (existing?.editedInInventoryAt) {
      summary.houses.skipped++;
      return { id: existing.id, completionYear: existing.completionYear };
    }

    if (existing) {
      const updated = await this.prisma.house.update({
        where: { id: existing.id },
        data: sharedData,
      });
      summary.houses.updated++;
      return { id: updated.id, completionYear: updated.completionYear };
    }

    if (deleted.house.has(externalId)) {
      summary.houses.skipped++;
      return null;
    }

    const slug = `${this.slugify(`${house.projectName}-${title}`)}-${house.id}`;
    const created = await this.prisma.house.create({
      data: {
        ...sharedData,
        completionYear: handover?.year ?? new Date().getFullYear(),
        slug,
        similarApartmentIds: [],
        gallery: [],
        documents: [],
        externalId,
      },
    });
    summary.houses.created++;
    return { id: created.id, completionYear: created.completionYear };
  }

  private async loadDeletedIds(): Promise<DeletedIds> {
    const rows = await this.prisma.profitbaseDeletion.findMany();
    const ids: DeletedIds = {
      category: new Set(),
      house: new Set(),
      unitLayout: new Set(),
    };
    for (const row of rows) {
      ids[row.entity as keyof DeletedIds]?.add(row.externalId);
    }
    return ids;
  }

  /** Unit type ids by name, so the sync can reuse the ones it created. */
  private async loadUnitTypeIds(): Promise<Map<string, string>> {
    const options = await this.prisma.unitTypeOption.findMany({
      select: { id: true, name: true },
    });
    return new Map(options.map((option) => [option.name, option.id]));
  }

  private async unitTypeOptionId(
    property: ProfitbaseProperty,
    unitTypeIds: Map<string, string>,
  ): Promise<string | null> {
    const unitType = unitTypeFor(property);
    if (!unitType) return null;

    const known = unitTypeIds.get(unitType.name);
    if (known) return known;

    const option = await this.prisma.unitTypeOption.upsert({
      where: { name: unitType.name },
      update: {},
      create: unitType,
    });
    unitTypeIds.set(unitType.name, option.id);
    return option.id;
  }

  private async upsertUnitLayout(
    plan: ProfitbasePlan | null,
    property: ProfitbaseProperty,
    categoryId: string,
    syncedHouse: SyncedHouse | null,
    parentHouse: ProfitbaseHouse | null,
    unitTypeIds: Map<string, string>,
    deleted: DeletedIds,
    summary: ProfitbaseSyncSummary,
    mirrored: Map<string, string>,
  ): Promise<void> {
    const externalId = String(property.id);
    const existing = await this.prisma.unitLayout.findUnique({
      where: { externalId },
    });
    if (
      existing
        ? existing.editedInInventoryAt
        : deleted.unitLayout.has(externalId) ||
          deleted.house.has(String(property.house_id))
    ) {
      summary.unitLayouts.skipped++;
      return;
    }

    const currencyCode = parentHouse?.currency?.code || 'USD';
    const floor = property.floor ?? 0;
    const parking = isParking(property);
    // Units of an archived house come off the site with it; an archived
    // project has all of its houses archived.
    const houseArchived =
      property.isHouseArchive || (parentHouse?.isArchive ?? false);

    const statusInfo = STATUS_MAP[property.status] ?? {
      status: 'available',
      archived: false,
    };

    // Areas, price and images describe the layout, so the plan wins; the
    // property values are the fallback for units Profitbase has no plan for.
    const totalArea =
      this.parseNumber(plan?.areaRange?.min) ?? property.area?.area_total ?? 0;
    const price =
      this.parseNumber(plan?.priceRange?.min) ?? property.price?.value ?? null;
    // Profitbase counts bedrooms; a studio has none.
    const roomCount = property.studio
      ? 0
      : (plan?.roomsAmount ?? property.rooms_amount ?? null);

    // Main and cover are the same picture, so they are built once. The address
    // is this API's copy of it, never Profitbase's own.
    const planImage = plan?.image
      ? {
          url: this.stored(mirrored, plan.image.source)!,
          alt: plan.image.imageName || undefined,
        }
      : null;
    const gallery = (plan?.planImages || []).map((img) => ({
      url: this.stored(mirrored, img.big || img.source)!,
      alt: img.imageName || undefined,
    }));

    // Profitbase reports a missing living area as 0 as well as null.
    const livingArea = property.area?.area_living;
    const { renovation, furnishing } = unitFinishing(property, parentHouse);

    const sharedData = {
      floor,
      unitCode: property.number || null,
      // The panel edits `number`, the site reads `rooms`; both hold the count.
      number: roomCount,
      rooms: roomCount,
      entrance: property.sectionName || null,
      unitTypeOptionId: await this.unitTypeOptionId(property, unitTypeIds),
      totalArea,
      internalArea: livingArea && livingArea > 0 ? livingArea : totalArea,
      balconyArea: customFieldNumber(property, CUSTOM_FIELD.externalArea),
      prices: price ? pricesInAllCurrencies(currencyCode, price) : {},
      // Units follow their house, whose year may also have been set by hand
      // when Profitbase has no handover date.
      ...(syncedHouse ? { completionYear: syncedHouse.completionYear } : {}),
      // A synced unit is one apartment on one floor. The building's floor
      // range lives on the house.
      numberOfFloors: { start: floor, end: floor },
      realEstateType: realEstateTypeLabel(property.propertyType),
      constructionStage:
        constructionStageFromUnit(
          customFieldValue(property, CUSTOM_FIELD.constructionStage),
        ) ?? constructionStageFromHouse(parentHouse),
      renovation,
      furnishing,
      status: statusInfo.status,
      archived: statusInfo.archived || parking || houseArchived,
      categoryId,
      houseId: syncedHouse?.id ?? null,
      // Plan images replace the unit's images only when Profitbase has them;
      // units without a plan keep whatever the panel uploaded.
      ...(planImage ? { mainImage: planImage, coverImage: planImage } : {}),
      ...(gallery.length > 0 ? { gallery } : {}),
    };

    if (existing) {
      await this.prisma.unitLayout.update({
        where: { id: existing.id },
        data: sharedData as any,
      });
      summary.unitLayouts.updated++;
      return;
    }

    const title = `${plan?.houseName || property.houseName || property.projectName} · ${property.number || property.id}`;
    const slug = `${this.slugify(title)}-${property.id}`;

    await this.prisma.unitLayout.create({
      data: {
        ...sharedData,
        completionYear: syncedHouse?.completionYear ?? new Date().getFullYear(),
        title,
        name: title,
        slug,
        similarApartmentIds: [],
        gallery,
        documents: [],
        externalId,
      } as any,
    });
    summary.unitLayouts.created++;
  }

  private async syncCategoryMetrics(categoryId: string) {
    const [housesCount, propertiesCount, reservedCount, soldCount] =
      await Promise.all([
        this.prisma.house.count({ where: { categoryId, archived: false } }),
        this.prisma.unitLayout.count({
          where: { categoryId, archived: false },
        }),
        this.prisma.unitLayout.count({
          where: { categoryId, archived: false, status: 'reserved' },
        }),
        this.prisma.unitLayout.count({
          where: { categoryId, archived: false, status: 'sold' },
        }),
      ]);

    await this.prisma.category.update({
      where: { id: categoryId },
      data: { housesCount, propertiesCount, reservedCount, soldCount },
    });
  }
}
