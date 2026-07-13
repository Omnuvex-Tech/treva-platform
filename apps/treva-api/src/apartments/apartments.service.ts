import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';

const APARTMENT_INCLUDE = {
  apartmentType: true,
  owner: true,
  prices: { include: { currency: true } },
};

const isDefined = <T>(value: T | undefined): value is T => value !== undefined;

@Injectable()
export class ApartmentsService {
  constructor(private prisma: PrismaService) {}

  private async attachOptionRelations<T extends { heatingTypeIds: string[]; viewOptionIds: string[] }>(
    apartments: T[],
  ) {
    const heatingTypeIds = [...new Set(apartments.flatMap((apartment) => apartment.heatingTypeIds || []))];
    const viewOptionIds = [...new Set(apartments.flatMap((apartment) => apartment.viewOptionIds || []))];

    const [heatingTypes, viewOptions] = await Promise.all([
      heatingTypeIds.length > 0
        ? this.prisma.heatingTypeOption.findMany({ where: { id: { in: heatingTypeIds } } })
        : Promise.resolve([]),
      viewOptionIds.length > 0
        ? this.prisma.viewOption.findMany({ where: { id: { in: viewOptionIds } } })
        : Promise.resolve([]),
    ]);

    const heatingTypeMap = new Map(heatingTypes.map((item) => [item.id, item]));
    const viewOptionMap = new Map(viewOptions.map((item) => [item.id, item]));

    return apartments.map((apartment) => ({
      ...apartment,
      heatingTypes: (apartment.heatingTypeIds || []).map((id) => heatingTypeMap.get(id)).filter(isDefined),
      viewOptions: (apartment.viewOptionIds || []).map((id) => viewOptionMap.get(id)).filter(isDefined),
    }));
  }

  private async resolveAttributes(attributeIds: string[]) {
    if (!attributeIds || attributeIds.length === 0) return [];
    return this.prisma.attribute.findMany({
      where: { id: { in: attributeIds } },
    });
  }

  private async resolveCurrencyId(currencyValue?: string): Promise<string | undefined> {
    if (!currencyValue) return undefined;
    const currency = await this.prisma.currency.findUnique({ where: { value: currencyValue } });
    return currency?.id;
  }

  private buildPricesWhere(minPrice?: number, maxPrice?: number, currencyId?: string) {
    if (!minPrice && !maxPrice && !currencyId) return undefined;
    const priceFilter: any = {};
    if (minPrice) priceFilter.priceTotal = { gte: minPrice };
    if (maxPrice) priceFilter.priceTotal = { ...(priceFilter.priceTotal || {}), lte: maxPrice };
    if (currencyId) priceFilter.currencyId = currencyId;
    return { some: priceFilter };
  }

  async create(dto: CreateApartmentDto) {
    const existing = await this.prisma.apartment.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Apartment with this slug already exists');
    }

    const { prices, ...apartmentData } = dto;

    const created = await this.prisma.apartment.create({
      data: {
        ...apartmentData,
        ...(prices && prices.length > 0
          ? {
              prices: {
                create: prices.map((p) => ({
                  currencyId: p.currencyId,
                  priceTotal: p.priceTotal ?? 0,
                  priceByArea: p.priceByArea ?? 0,
                })),
              },
            }
          : {}),
      },
      include: APARTMENT_INCLUDE,
    });

    const [apartmentWithOptions] = await this.attachOptionRelations([created]);
    return apartmentWithOptions;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    apartmentTypeId?: string;
    ownerId?: string;
    minPrice?: number;
    maxPrice?: number;
    roomCount?: number;
    minArea?: number;
    maxArea?: number;
    floor?: number;
    currency?: string;
    viewOptionIds?: string;
    status?: string;
  }) {
    const { page = 1, limit = 12, apartmentTypeId, ownerId, minPrice, maxPrice, roomCount, minArea, maxArea, floor, currency, viewOptionIds, status } = query;
    const skip = (page - 1) * limit;

    const resolvedCurrencyId = await this.resolveCurrencyId(currency);

    const where: any = {};
    if (apartmentTypeId) where.apartmentTypeId = apartmentTypeId;
    if (ownerId) where.ownerId = ownerId;
    if (roomCount) where.roomCount = roomCount;

    const pricesWhere = this.buildPricesWhere(minPrice, maxPrice, resolvedCurrencyId);
    if (pricesWhere) where.prices = pricesWhere;

    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area.gte = minArea;
      if (maxArea) where.area.lte = maxArea;
    }
    if (floor) {
      where.floorFrom = { lte: floor };
      where.floorTo = { gte: floor };
    }
    if (viewOptionIds) {
      const ids = viewOptionIds.split(',').filter(Boolean);
      if (ids.length > 0) where.viewOptionIds = { hasSome: ids };
    }
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.apartment.findMany({
        where,
        include: APARTMENT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.apartment.count({ where }),
    ]);

    const allAttrIds = [...new Set(data.flatMap((a) => a.attributeIds))];
    const allAttributes = allAttrIds.length > 0
      ? await this.prisma.attribute.findMany({ where: { id: { in: allAttrIds } } })
      : [];
    const attrMap = new Map(allAttributes.map((a) => [a.id, a]));

    const dataWithAttributes = data.map((apartment) => ({
      ...apartment,
      attributes: apartment.attributeIds.map((id) => attrMap.get(id)).filter(Boolean),
    }));

    const dataWithOptions = await this.attachOptionRelations(dataWithAttributes);

    return {
      data: dataWithOptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id },
      include: APARTMENT_INCLUDE,
    });
    if (!apartment) throw new NotFoundException('Apartment not found');
    const attributes = await this.resolveAttributes(apartment.attributeIds);
    const [apartmentWithOptions] = await this.attachOptionRelations([{ ...apartment, attributes }]);
    return apartmentWithOptions;
  }

  async findBySlug(slug: string) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { slug },
      include: APARTMENT_INCLUDE,
    });
    if (!apartment) throw new NotFoundException('Apartment not found');
    const attributes = await this.resolveAttributes(apartment.attributeIds);
    const [apartmentWithOptions] = await this.attachOptionRelations([{ ...apartment, attributes }]);
    return apartmentWithOptions;
  }

  async update(id: string, dto: UpdateApartmentDto) {
    const apartment = await this.prisma.apartment.findUnique({ where: { id } });
    if (!apartment) throw new NotFoundException('Apartment not found');

    if (dto.slug && dto.slug !== apartment.slug) {
      const existing = await this.prisma.apartment.findUnique({ where: { slug: dto.slug } });
      if (existing) throw new ConflictException('Apartment with this slug already exists');
    }

    const { prices, ...apartmentData } = dto;

    if (prices) {
      await this.prisma.apartmentPrice.deleteMany({ where: { apartmentId: id } });
      if (prices.length > 0) {
        await this.prisma.apartmentPrice.createMany({
          data: prices.map((p) => ({
            apartmentId: id,
            currencyId: p.currencyId,
            priceTotal: p.priceTotal ?? 0,
            priceByArea: p.priceByArea ?? 0,
          })),
        });
      }
    }

    const updated = await this.prisma.apartment.update({
      where: { id },
      data: apartmentData,
      include: APARTMENT_INCLUDE,
    });

    const [apartmentWithOptions] = await this.attachOptionRelations([updated]);
    return apartmentWithOptions;
  }

  async remove(id: string) {
    const apartment = await this.prisma.apartment.findUnique({ where: { id } });
    if (!apartment) throw new NotFoundException('Apartment not found');
    return this.prisma.apartment.delete({ where: { id } });
  }

  async getRange(currency?: string) {
    const priceWhere: any = {};
    if (currency) {
      const resolvedId = await this.resolveCurrencyId(currency);
      if (resolvedId) priceWhere.currencyId = resolvedId;
    }

    const result = await this.prisma.apartmentPrice.aggregate({
      where: Object.keys(priceWhere).length > 0 ? priceWhere : undefined,
      _max: { priceTotal: true },
      _min: { priceTotal: true },
    });

    const areaResult = await this.prisma.apartment.aggregate({
      _max: { area: true },
      _min: { area: true },
    });

    return {
      maxPrice: result._max.priceTotal ?? 0,
      minPrice: result._min.priceTotal ?? 0,
      maxTotalArea: areaResult._max.area ?? 0,
      minTotalArea: areaResult._min.area ?? 0,
    };
  }
}
