import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitLayoutDto } from './dto/create-unit-layout.dto';
import { UpdateUnitLayoutDto } from './dto/update-unit-layout.dto';

@Injectable()
export class UnitLayoutsService {
  constructor(private prisma: PrismaService) {}

  private async syncCategoryMetrics(categoryId: string) {
    const [housesCount, propertiesCount, reservedCount, soldCount] = await Promise.all([
      this.prisma.house.count({ where: { categoryId, archived: false } }),
      this.prisma.unitLayout.count({ where: { categoryId, archived: false } }),
      this.prisma.unitLayout.count({ where: { categoryId, archived: false, status: 'reserved' } }),
      this.prisma.unitLayout.count({ where: { categoryId, archived: false, status: 'sold' } }),
    ]);

    await this.prisma.category.update({
      where: { id: categoryId },
      data: { housesCount, propertiesCount, reservedCount, soldCount },
    });
  }

  async create(createDto: CreateUnitLayoutDto) {
    const existingSlug = await this.prisma.unitLayout.findUnique({
      where: { slug: createDto.slug },
    });

    if (existingSlug) {
      throw new ConflictException('Unit layout with this slug already exists');
    }

    const layout = await this.prisma.unitLayout.create({
      data: {
        title: createDto.title,
        name: createDto.name,
        slug: createDto.slug,
        seoTitle: createDto.seoTitle,
        seoDescription: createDto.seoDescription,
        seoKeywords: createDto.seoKeywords,
        canonicalUrl: createDto.canonicalUrl,
        seoImage: createDto.seoImage,
          status: createDto.status || 'available',
        categoryId: createDto.categoryId,
        unitTypeOptionId: createDto.unitTypeOptionId,
        realEstateType: createDto.realEstateType,
        floor: createDto.floor,
        number: createDto.number,
        entrance: createDto.entrance,
        totalArea: createDto.totalArea,
        internalArea: createDto.internalArea,
        balconyArea: createDto.balconyArea,
        prices: createDto.prices as any || {},
        completionYear: createDto.completionYear,
        numberOfFloors: createDto.numberOfFloors as any,
        similarApartmentIds: createDto.similarApartmentIds || [],
        mainImage: createDto.mainImage as any,
          coverImage: createDto.coverImage as any,
        gallery: createDto.gallery as any[] || [],
        documents: createDto.documents as any[] || [],
        houseId: createDto.houseId,
        typeOfBuilding: createDto.typeOfBuilding,
        constructionStage: createDto.constructionStage,
        description: createDto.description,
        heatingTypeIds: createDto.heatingTypeIds || [],
        attributeIds: createDto.attributeIds || [],
      },
      include: { category: true, house: true, unitTypeOption: true },
    });

    await this.syncCategoryMetrics(createDto.categoryId);
    return layout;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    categoryId?: string;
    categorySlug?: string;
      status?: 'available' | 'reserved' | 'sold';
    statusOptionId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    currency?: string;
    minArea?: number;
    maxArea?: number;
    floor?: number;
    unitTypeOptionId?: string;
    rooms?: string;
    houseId?: string;
    houseSlug?: string;
    archived?: boolean;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;
    const currency = query.currency || 'USD';

    const where: any = {};

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: query.categorySlug },
      });
      if (category) {
        where.categoryId = category.id;
      } else {
        where.categoryId = '__missing__';
      }
    }

    if (query.houseId) {
      where.houseId = query.houseId;
    }

    if (query.houseSlug) {
      const house = await this.prisma.house.findUnique({
        where: { slug: query.houseSlug },
      });
      if (house) {
        where.houseId = house.id;
      }
    }

    if (query.statusOptionId) {
      where.statusOptionId = query.statusOptionId;
    } else if (query.status) {
      where.status = query.status;
    }

    if (query.archived !== undefined) {
      where.archived = query.archived;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.minPrice || query.maxPrice) {
      where[`prices_${currency}`] = {};
      const priceField = { path: [currency] };
      where.OR = [
        {
          prices: {
            path: [currency],
            gte: query.minPrice || 0,
            ...(query.maxPrice ? { lte: query.maxPrice } : {}),
          },
        },
      ];
      if (query.minPrice && query.maxPrice) {
        where.OR = [
          {
            prices: {
              path: [currency],
              gte: query.minPrice,
              lte: query.maxPrice,
            },
          },
        ];
      } else if (query.minPrice) {
        where.OR = [
          {
            prices: {
              path: [currency],
              gte: query.minPrice,
            },
          },
        ];
      } else if (query.maxPrice) {
        where.OR = [
          {
            prices: {
              path: [currency],
              lte: query.maxPrice,
            },
          },
        ];
      }
    }

    if (query.minArea || query.maxArea) {
      where.totalArea = {};
      if (query.minArea) where.totalArea.gte = query.minArea;
      if (query.maxArea) where.totalArea.lte = query.maxArea;
    }

    if (query.floor) {
      where.floor = query.floor;
    }

    if (query.unitTypeOptionId) {
      where.unitTypeOptionId = query.unitTypeOptionId;
    }

    if (query.rooms) {
      const raw = String(query.rooms).trim().toLowerCase();
      if (raw === '4plus' || raw === '4+' || raw === '4 ') {
        where.number = { gte: 4 };
      } else {
        const parsed = parseInt(raw, 10);
        if (Number.isFinite(parsed)) {
          where.number = parsed;
        }
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.unitLayout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          house: true,
          unitTypeOption: true,
        },
      }),
      this.prisma.unitLayout.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const unitLayout = await this.prisma.unitLayout.findUnique({
      where: { id },
      include: { category: true, unitTypeOption: true, house: true },
    });

    if (!unitLayout) {
      throw new NotFoundException('Unit layout not found');
    }

    let similarApartments: any[] = [];
    if (unitLayout.similarApartmentIds && unitLayout.similarApartmentIds.length > 0) {
      similarApartments = await this.prisma.unitLayout.findMany({
        where: { id: { in: unitLayout.similarApartmentIds } },
      include: { category: true, house: true },
      });
    }

    return { ...unitLayout, similarApartments };
  }

  async findBySlug(slug: string) {
    const unitLayout = await this.prisma.unitLayout.findUnique({
      where: { slug },
      include: { category: true, unitTypeOption: true, house: true },
    });

    if (!unitLayout) {
      throw new NotFoundException('Unit layout not found');
    }

    let similarApartments: any[] = [];
    if (unitLayout.similarApartmentIds && unitLayout.similarApartmentIds.length > 0) {
      similarApartments = await this.prisma.unitLayout.findMany({
        where: { id: { in: unitLayout.similarApartmentIds } },
      include: { category: true, house: true },
      });
    }

    return { ...unitLayout, similarApartments };
  }

  async update(id: string, updateDto: UpdateUnitLayoutDto) {
    const existing = await this.prisma.unitLayout.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Unit layout not found');
    }

    if (updateDto.slug && updateDto.slug !== existing.slug) {
      const slugExists = await this.prisma.unitLayout.findUnique({
        where: { slug: updateDto.slug },
      });
      if (slugExists) {
        throw new ConflictException('Unit layout with this slug already exists');
      }
    }

    const data: any = {};
    if (updateDto.title !== undefined) data.title = updateDto.title;
    if (updateDto.name !== undefined) data.name = updateDto.name;
    if (updateDto.slug !== undefined) data.slug = updateDto.slug;
    if (updateDto.seoTitle !== undefined) data.seoTitle = updateDto.seoTitle;
    if (updateDto.seoDescription !== undefined) data.seoDescription = updateDto.seoDescription;
    if (updateDto.seoKeywords !== undefined) data.seoKeywords = updateDto.seoKeywords;
    if (updateDto.canonicalUrl !== undefined) data.canonicalUrl = updateDto.canonicalUrl;
    if (updateDto.seoImage !== undefined) data.seoImage = updateDto.seoImage;
    if (updateDto.status !== undefined) data.status = updateDto.status;
    if (updateDto.archived !== undefined) data.archived = updateDto.archived;
    if (updateDto.categoryId !== undefined) data.categoryId = updateDto.categoryId;
    if (updateDto.houseId !== undefined) data.houseId = updateDto.houseId;
    if (updateDto.unitTypeOptionId !== undefined) data.unitTypeOptionId = updateDto.unitTypeOptionId;
    if (updateDto.realEstateType !== undefined) data.realEstateType = updateDto.realEstateType;
    if (updateDto.floor !== undefined) data.floor = updateDto.floor;
    if (updateDto.number !== undefined) data.number = updateDto.number;
    if (updateDto.entrance !== undefined) data.entrance = updateDto.entrance;
    if (updateDto.totalArea !== undefined) data.totalArea = updateDto.totalArea;
    if (updateDto.internalArea !== undefined) data.internalArea = updateDto.internalArea;
    if (updateDto.balconyArea !== undefined) data.balconyArea = updateDto.balconyArea;
    if (updateDto.prices !== undefined) data.prices = updateDto.prices;
    if (updateDto.completionYear !== undefined) data.completionYear = updateDto.completionYear;
    if (updateDto.numberOfFloors) data.numberOfFloors = updateDto.numberOfFloors;
    if (updateDto.similarApartmentIds) data.similarApartmentIds = updateDto.similarApartmentIds;
    if (updateDto.mainImage !== undefined) data.mainImage = updateDto.mainImage;
        if (updateDto.coverImage !== undefined) data.coverImage = updateDto.coverImage;
    if (updateDto.gallery !== undefined) data.gallery = updateDto.gallery;
    if (updateDto.documents !== undefined) data.documents = updateDto.documents;
    if (updateDto.typeOfBuilding !== undefined) data.typeOfBuilding = updateDto.typeOfBuilding;
    if (updateDto.constructionStage !== undefined) data.constructionStage = updateDto.constructionStage;
    if (updateDto.description !== undefined) data.description = updateDto.description;
    if (updateDto.heatingTypeIds !== undefined) data.heatingTypeIds = updateDto.heatingTypeIds;
    if (updateDto.attributeIds !== undefined) data.attributeIds = updateDto.attributeIds;

    const layout = await this.prisma.unitLayout.update({
      where: { id },
      data,
      include: { category: true, unitTypeOption: true, house: true },
    });

    await this.syncCategoryMetrics(layout.categoryId);
    if (existing.categoryId !== layout.categoryId) {
      await this.syncCategoryMetrics(existing.categoryId);
    }

    return layout;
  }

  async remove(id: string) {
    const existing = await this.prisma.unitLayout.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Unit layout not found');
    }

    const result = await this.prisma.unitLayout.delete({
      where: { id },
    });

    await this.syncCategoryMetrics(existing.categoryId);
    return result;
  }

  async count() {
    return this.prisma.unitLayout.count();
  }

  async findFloors() {
    const result = await this.prisma.unitLayout.findMany({
      select: { floor: true },
      distinct: ['floor'],
      orderBy: { floor: 'asc' },
    });
    return result.map(r => r.floor);
  }

  async findRange(currency: string = 'USD') {
    const layouts = await this.prisma.unitLayout.findMany({
      select: { prices: true, totalArea: true },
    });

    let maxPrice = 0;
    let minPrice = Infinity;
    let maxTotalArea = 0;
    let minTotalArea = Infinity;

    for (const layout of layouts) {
      const prices = layout.prices as Record<string, number>;
      const price = prices?.[currency] || 0;
      if (price > maxPrice) maxPrice = price;
      if (price < minPrice && price > 0) minPrice = price;
      if (layout.totalArea > maxTotalArea) maxTotalArea = layout.totalArea;
      if (layout.totalArea < minTotalArea) minTotalArea = layout.totalArea;
    }

    return {
      maxPrice: maxPrice || 0,
      minPrice: minPrice === Infinity ? 0 : minPrice,
      maxTotalArea: maxTotalArea || 0,
      minTotalArea: minTotalArea === Infinity ? 0 : minTotalArea,
    };
  }

  async countByStatus() {
    const [available, sold, reserved] = await Promise.all([
      this.prisma.unitLayout.count({ where: { status: 'available' } }),
      this.prisma.unitLayout.count({ where: { status: 'sold' } }),
      this.prisma.unitLayout.count({ where: { status: 'reserved' } }),
    ]);
    return { available, sold, reserved, total: available + sold + reserved };
  }
}
