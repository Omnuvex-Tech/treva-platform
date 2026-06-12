import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitLayoutDto } from './dto/create-unit-layout.dto';
import { UpdateUnitLayoutDto } from './dto/update-unit-layout.dto';

@Injectable()
export class UnitLayoutsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateUnitLayoutDto) {
    const existingSlug = await this.prisma.unitLayout.findUnique({
      where: { slug: createDto.slug },
    });

    if (existingSlug) {
      throw new ConflictException('Unit layout with this slug already exists');
    }

    return this.prisma.unitLayout.create({
      data: {
        title: createDto.title,
        name: createDto.name,
        slug: createDto.slug,
        status: (createDto.status as any) || 'available',
        categoryId: createDto.categoryId,
        roomOptionId: createDto.roomOptionId,
        floor: createDto.floor,
        number: createDto.number,
        totalArea: createDto.totalArea,
        internalArea: createDto.internalArea,
        balconyArea: createDto.balconyArea,
        prices: createDto.prices as any || {},
        completionYear: createDto.completionYear,
        numberOfFloors: createDto.numberOfFloors as any,
        viewOptionId: createDto.viewOptionId,
        similarApartmentIds: createDto.similarApartmentIds || [],
        mainImage: createDto.mainImage as any,
        gallery: createDto.gallery as any[] || [],
        documents: createDto.documents as any[] || [],
        location: createDto.location as any,
      },
      include: { category: true },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    categoryId?: string;
    status?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    currency?: string;
    minArea?: number;
    maxArea?: number;
    floor?: number;
    viewOptionId?: string;
    roomOptionId?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;
    const currency = query.currency || 'USD';

    const where: any = {};

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.status) {
      where.status = query.status;
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

    if (query.viewOptionId) {
      where.viewOptionId = query.viewOptionId;
    }

    if (query.roomOptionId) {
      where.roomOptionId = query.roomOptionId;
    }

    const [data, total] = await Promise.all([
      this.prisma.unitLayout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          roomOption: true,
          viewOption: true,
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
      include: { category: true, roomOption: true, viewOption: true },
    });

    if (!unitLayout) {
      throw new NotFoundException('Unit layout not found');
    }

    let similarApartments: any[] = [];
    if (unitLayout.similarApartmentIds && unitLayout.similarApartmentIds.length > 0) {
      similarApartments = await this.prisma.unitLayout.findMany({
        where: { id: { in: unitLayout.similarApartmentIds } },
        include: { category: true },
      });
    }

    return { ...unitLayout, similarApartments };
  }

  async findBySlug(slug: string) {
    const unitLayout = await this.prisma.unitLayout.findUnique({
      where: { slug },
      include: { category: true, roomOption: true, viewOption: true },
    });

    if (!unitLayout) {
      throw new NotFoundException('Unit layout not found');
    }

    let similarApartments: any[] = [];
    if (unitLayout.similarApartmentIds && unitLayout.similarApartmentIds.length > 0) {
      similarApartments = await this.prisma.unitLayout.findMany({
        where: { id: { in: unitLayout.similarApartmentIds } },
        include: { category: true },
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
    if (updateDto.status !== undefined) data.status = updateDto.status;
    if (updateDto.categoryId !== undefined) data.categoryId = updateDto.categoryId;
    if (updateDto.roomOptionId !== undefined) data.roomOptionId = updateDto.roomOptionId;
    if (updateDto.floor !== undefined) data.floor = updateDto.floor;
    if (updateDto.number !== undefined) data.number = updateDto.number;
    if (updateDto.totalArea !== undefined) data.totalArea = updateDto.totalArea;
    if (updateDto.internalArea !== undefined) data.internalArea = updateDto.internalArea;
    if (updateDto.balconyArea !== undefined) data.balconyArea = updateDto.balconyArea;
    if (updateDto.prices !== undefined) data.prices = updateDto.prices;
    if (updateDto.completionYear !== undefined) data.completionYear = updateDto.completionYear;
    if (updateDto.numberOfFloors) data.numberOfFloors = updateDto.numberOfFloors;
    if (updateDto.viewOptionId !== undefined) data.viewOptionId = updateDto.viewOptionId;
    if (updateDto.similarApartmentIds) data.similarApartmentIds = updateDto.similarApartmentIds;
    if (updateDto.mainImage !== undefined) data.mainImage = updateDto.mainImage;
    if (updateDto.gallery !== undefined) data.gallery = updateDto.gallery;
    if (updateDto.documents !== undefined) data.documents = updateDto.documents;
    if (updateDto.location !== undefined) data.location = updateDto.location;

    return this.prisma.unitLayout.update({
      where: { id },
      data,
      include: { category: true, roomOption: true },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.unitLayout.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Unit layout not found');
    }

    return this.prisma.unitLayout.delete({
      where: { id },
    });
  }

  async count() {
    return this.prisma.unitLayout.count();
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
