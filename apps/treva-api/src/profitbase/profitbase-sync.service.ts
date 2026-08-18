import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ProfitbaseClientService,
  ProfitbaseHouse,
  ProfitbasePlan,
  ProfitbaseProperty,
} from './profitbase-client.service';

interface SyncCounters {
  created: number;
  updated: number;
}

export interface ProfitbaseSyncSummary {
  categories: SyncCounters;
  houses: SyncCounters;
  unitLayouts: SyncCounters;
}

const REAL_ESTATE_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  townhouse: 'Townhouse',
  villa: 'Villa',
  commercial_premises: 'Commercial',
};

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
  ) {}

  private slugify(value: string): string {
    const slug = value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return slug || 'item';
  }

  private parseYear(value: string | null): number | null {
    if (!value) return null;
    const match = /\d{4}/.exec(value);
    return match ? Number(match[0]) : null;
  }

  async sync(): Promise<ProfitbaseSyncSummary> {
    const [houses, plans, properties] = await Promise.all([
      this.client.getHouses(),
      this.client.getPlans(),
      this.client.getProperties(),
    ]);

    const summary: ProfitbaseSyncSummary = {
      categories: { created: 0, updated: 0 },
      houses: { created: 0, updated: 0 },
      unitLayouts: { created: 0, updated: 0 },
    };

    const planByPropertyId = new Map<string, ProfitbasePlan>();
    for (const plan of plans) {
      const propertyId = plan.properties?.[0];
      if (propertyId) planByPropertyId.set(propertyId, plan);
    }

    const projectNameById = new Map<number, string>();
    for (const house of houses)
      projectNameById.set(house.projectId, house.projectName);
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
        summary,
      );
      categoryIdByProjectId.set(projectId, categoryId);
    }

    const houseById = new Map<number, ProfitbaseHouse>();
    const houseIdByExternalId = new Map<number, string>();
    for (const house of houses) {
      houseById.set(house.id, house);
      const categoryId = categoryIdByProjectId.get(house.projectId);
      if (!categoryId) continue;
      const houseId = await this.upsertHouse(house, categoryId, summary);
      houseIdByExternalId.set(house.id, houseId);
    }

    const touchedCategoryIds = new Set<string>(categoryIdByProjectId.values());

    for (const property of properties) {
      const categoryId = categoryIdByProjectId.get(property.projectId);
      if (!categoryId) continue;
      const houseId = houseIdByExternalId.get(property.house_id) ?? null;
      const parentHouse = houseById.get(property.house_id) ?? null;
      const plan = planByPropertyId.get(String(property.id)) ?? null;

      await this.upsertUnitLayout(
        property,
        plan,
        categoryId,
        houseId,
        parentHouse,
        summary,
      );
    }

    for (const categoryId of touchedCategoryIds) {
      await this.syncCategoryMetrics(categoryId);
    }

    return summary;
  }

  private async upsertCategory(
    projectId: number,
    projectName: string,
    summary: ProfitbaseSyncSummary,
  ): Promise<string> {
    const externalId = String(projectId);
    const existing = await this.prisma.category.findUnique({
      where: { externalId },
    });

    if (existing) {
      await this.prisma.category.update({
        where: { id: existing.id },
        data: { title: projectName, name: projectName },
      });
      summary.categories.updated++;
      return existing.id;
    }

    const slug = `${this.slugify(projectName)}-${projectId}`;
    const created = await this.prisma.category.create({
      data: {
        title: projectName,
        name: projectName,
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
    summary: ProfitbaseSyncSummary,
  ): Promise<string> {
    const externalId = String(house.id);
    const minFloor = house.minFloor ?? 1;
    const maxFloor = Math.max(house.maxFloor ?? minFloor, minFloor);
    const completionYear =
      this.parseYear(house.commissioningDate) ?? new Date().getFullYear();
    const referenceArea = Number(house.minPriceArea) || 0;
    const currencyCode = house.currency?.code || 'USD';
    const imageUrl = house.fullImage || house.image || undefined;

    const sharedData = {
      floor: minFloor,
      totalArea: referenceArea,
      internalArea: referenceArea,
      prices: house.minPrice ? { [currencyCode]: house.minPrice } : {},
      completionYear,
      numberOfFloors: { start: minFloor, end: maxFloor },
      locationTitle: house.address?.full || undefined,
      street: house.street || house.address?.street || undefined,
      houseNumber: house.number || house.address?.number || undefined,
      contractAddress: house.contractAddress || undefined,
      typeOfBuilding: house.type || undefined,
      archived: house.isArchive ?? false,
      mainImage: imageUrl
        ? { url: imageUrl, alt: house.title || undefined }
        : undefined,
    };

    const existing = await this.prisma.house.findUnique({
      where: { externalId },
    });

    if (existing) {
      await this.prisma.house.update({
        where: { id: existing.id },
        data: sharedData,
      });
      summary.houses.updated++;
      return existing.id;
    }

    const title = house.title || house.projectName;
    const slug = `${this.slugify(`${house.projectName}-${title}`)}-${house.id}`;
    const created = await this.prisma.house.create({
      data: {
        ...sharedData,
        title,
        name: title,
        slug,
        categoryId,
        similarApartmentIds: [],
        gallery: [],
        documents: [],
        externalId,
      },
    });
    summary.houses.created++;
    return created.id;
  }

  private async upsertUnitLayout(
    property: ProfitbaseProperty,
    plan: ProfitbasePlan | null,
    categoryId: string,
    houseId: string | null,
    parentHouse: ProfitbaseHouse | null,
    summary: ProfitbaseSyncSummary,
  ): Promise<void> {
    const externalId = String(property.id);
    const currencyCode = parentHouse?.currency?.code || 'USD';
    const completionYear =
      this.parseYear(parentHouse?.commissioningDate ?? null) ??
      new Date().getFullYear();
    const minFloor = parentHouse?.minFloor ?? 1;
    const maxFloor = Math.max(parentHouse?.maxFloor ?? minFloor, minFloor);
    const statusInfo = STATUS_MAP[property.status] ?? {
      status: 'available',
      archived: false,
    };
    const totalArea = property.area?.area_total ?? 0;
    const propertyTypeLabel = property.propertyType
      ? (REAL_ESTATE_TYPE_LABELS[property.propertyType] ??
        property.propertyType)
      : undefined;

    const mainImage = plan?.image
      ? {
          url: plan.image.big || plan.image.source,
          alt: plan.image.imageName || undefined,
        }
      : undefined;
    const gallery = (plan?.planImages || []).map((img) => ({
      url: img.big || img.source,
      alt: img.imageName || undefined,
    }));

    const sharedData = {
      floor: property.floor ?? 0,
      unitCode: property.number || undefined,
      rooms: property.rooms_amount ?? undefined,
      totalArea,
      internalArea: property.area?.area_living ?? totalArea,
      balconyArea: property.area?.area_balcony ?? undefined,
      prices: property.price?.value
        ? { [currencyCode]: property.price.value }
        : {},
      completionYear,
      numberOfFloors: { start: minFloor, end: maxFloor },
      realEstateType: propertyTypeLabel,
      status: statusInfo.status,
      archived: statusInfo.archived,
      categoryId,
      houseId,
      mainImage,
      gallery,
    };

    const existing = await this.prisma.unitLayout.findUnique({
      where: { externalId },
    });

    if (existing) {
      await this.prisma.unitLayout.update({
        where: { id: existing.id },
        data: sharedData as any,
      });
      summary.unitLayouts.updated++;
      return;
    }

    const title = `${property.houseName || property.projectName} · ${property.number || property.id}`;
    const slug = `${this.slugify(title)}-${property.id}`;

    await this.prisma.unitLayout.create({
      data: {
        ...sharedData,
        title,
        name: title,
        slug,
        similarApartmentIds: [],
        gallery: gallery as any,
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
