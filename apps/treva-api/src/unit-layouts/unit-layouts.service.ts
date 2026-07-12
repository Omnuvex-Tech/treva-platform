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
        statusOptionId: createDto.statusOptionId,
        similarApartmentIds: createDto.similarApartmentIds || [],
        mainImage: createDto.mainImage as any,
        gallery: createDto.gallery as any[] || [],
        documents: createDto.documents as any[] || [],
        location: createDto.location as any,
        lcd: createDto.lcd,
        typeOfBuilding: createDto.typeOfBuilding,
        defaultPropertyType: createDto.defaultPropertyType,
        constructionStage: createDto.constructionStage,
        startOfConstruction: createDto.startOfConstruction as any,
        completionOfConstruction: createDto.completionOfConstruction as any,
        startOfSales: createDto.startOfSales as any,
        endOfSales: createDto.endOfSales as any,
        salesOffice: createDto.salesOffice,
        contractAddress: createDto.contractAddress,
        street: createDto.street,
        houseNumber: createDto.houseNumber,
        deadlineForCommissioning: createDto.deadlineForCommissioning ? new Date(createDto.deadlineForCommissioning) : undefined,
        landCadastralNumber: createDto.landCadastralNumber,
        showroomAvailability: createDto.showroomAvailability,
        renovation: createDto.renovation,
        wallMaterial: createDto.wallMaterial,
        description: createDto.description,
        ownerId: createDto.ownerId,
        heatingTypeIds: createDto.heatingTypeIds || [],
        attributeIds: createDto.attributeIds || [],
        locationTitle: createDto.locationTitle,
        locationUrl: createDto.locationUrl,
      },
      include: { category: true, owner: true },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    categoryId?: string;
    categorySlug?: string;
    statusOptionId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    currency?: string;
    minArea?: number;
    maxArea?: number;
    floor?: number;
    viewOptionId?: string;
    roomOptionId?: string;
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
      }
    }

    if (query.statusOptionId) {
      where.statusOptionId = query.statusOptionId;
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
          statusOption: true,
          owner: true,
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
      include: { category: true, roomOption: true, viewOption: true, statusOption: true, owner: true },
    });

    if (!unitLayout) {
      throw new NotFoundException('Unit layout not found');
    }

    let similarApartments: any[] = [];
    if (unitLayout.similarApartmentIds && unitLayout.similarApartmentIds.length > 0) {
      similarApartments = await this.prisma.unitLayout.findMany({
        where: { id: { in: unitLayout.similarApartmentIds } },
        include: { category: true, statusOption: true },
      });
    }

    return { ...unitLayout, similarApartments };
  }

  async findBySlug(slug: string) {
    const unitLayout = await this.prisma.unitLayout.findUnique({
      where: { slug },
      include: { category: true, roomOption: true, viewOption: true, statusOption: true, owner: true },
    });

    if (!unitLayout) {
      throw new NotFoundException('Unit layout not found');
    }

    let similarApartments: any[] = [];
    if (unitLayout.similarApartmentIds && unitLayout.similarApartmentIds.length > 0) {
      similarApartments = await this.prisma.unitLayout.findMany({
        where: { id: { in: unitLayout.similarApartmentIds } },
        include: { category: true, statusOption: true },
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
    if (updateDto.statusOptionId !== undefined) data.statusOptionId = updateDto.statusOptionId;
    if (updateDto.archived !== undefined) data.archived = updateDto.archived;
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
    if (updateDto.lcd !== undefined) data.lcd = updateDto.lcd;
    if (updateDto.typeOfBuilding !== undefined) data.typeOfBuilding = updateDto.typeOfBuilding;
    if (updateDto.defaultPropertyType !== undefined) data.defaultPropertyType = updateDto.defaultPropertyType;
    if (updateDto.constructionStage !== undefined) data.constructionStage = updateDto.constructionStage;
    if (updateDto.startOfConstruction !== undefined) data.startOfConstruction = updateDto.startOfConstruction;
    if (updateDto.completionOfConstruction !== undefined) data.completionOfConstruction = updateDto.completionOfConstruction;
    if (updateDto.startOfSales !== undefined) data.startOfSales = updateDto.startOfSales;
    if (updateDto.endOfSales !== undefined) data.endOfSales = updateDto.endOfSales;
    if (updateDto.salesOffice !== undefined) data.salesOffice = updateDto.salesOffice;
    if (updateDto.contractAddress !== undefined) data.contractAddress = updateDto.contractAddress;
    if (updateDto.street !== undefined) data.street = updateDto.street;
    if (updateDto.houseNumber !== undefined) data.houseNumber = updateDto.houseNumber;
    if (updateDto.deadlineForCommissioning !== undefined) data.deadlineForCommissioning = updateDto.deadlineForCommissioning ? new Date(updateDto.deadlineForCommissioning) : null;
    if (updateDto.landCadastralNumber !== undefined) data.landCadastralNumber = updateDto.landCadastralNumber;
    if (updateDto.showroomAvailability !== undefined) data.showroomAvailability = updateDto.showroomAvailability;
    if (updateDto.renovation !== undefined) data.renovation = updateDto.renovation;
    if (updateDto.wallMaterial !== undefined) data.wallMaterial = updateDto.wallMaterial;
    if (updateDto.description !== undefined) data.description = updateDto.description;
    if (updateDto.ownerId !== undefined) data.ownerId = updateDto.ownerId;
    if (updateDto.heatingTypeIds !== undefined) data.heatingTypeIds = updateDto.heatingTypeIds;
    if (updateDto.attributeIds !== undefined) data.attributeIds = updateDto.attributeIds;
    if (updateDto.locationTitle !== undefined) data.locationTitle = updateDto.locationTitle;
    if (updateDto.locationUrl !== undefined) data.locationUrl = updateDto.locationUrl;

    return this.prisma.unitLayout.update({
      where: { id },
      data,
      include: { category: true, roomOption: true, statusOption: true, owner: true },
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
      this.prisma.unitLayout.count({ where: { statusOption: { value: 'Available' } } }),
this.prisma.unitLayout.count({ where: { statusOption: { value: 'Sold' } } }),
this.prisma.unitLayout.count({ where: { statusOption: { value: 'Reserved' } } }),
    ]);
    return { available, sold, reserved, total: available + sold + reserved };
  }
}
