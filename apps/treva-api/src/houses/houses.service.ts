import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';

@Injectable()
export class HousesService {
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

  async create(createDto: CreateHouseDto) {
    const existingSlug = await this.prisma.house.findUnique({
      where: { slug: createDto.slug },
    });

    if (existingSlug) {
      throw new ConflictException('House with this slug already exists');
    }

    const house = await this.prisma.house.create({
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
        archived: createDto.archived ?? false,
        categoryId: createDto.categoryId,
        roomOptionId: createDto.roomOptionId,
        floor: createDto.floor,
        number: createDto.number,
        totalArea: createDto.totalArea,
        internalArea: createDto.internalArea,
        balconyArea: createDto.balconyArea,
        prices: (createDto.prices as any) || {},
        completionYear: createDto.completionYear,
        numberOfFloors: createDto.numberOfFloors as any,
        similarApartmentIds: createDto.similarApartmentIds || [],
        mainImage: createDto.mainImage as any,
        coverImage: createDto.coverImage as any,
        gallery: (createDto.gallery as any[]) || [],
        documents: (createDto.documents as any[]) || [],
        location: createDto.location as any,
        typeOfBuilding: createDto.typeOfBuilding,
        constructionStage: createDto.constructionStage,
        startOfConstruction: createDto.startOfConstruction as any,
        completionOfConstruction: createDto.completionOfConstruction as any,
        startOfSales: createDto.startOfSales as any,
        endOfSales: createDto.endOfSales as any,
        description: createDto.description,
        ownerId: createDto.ownerId,
        heatingTypeIds: createDto.heatingTypeIds || [],
        attributeIds: createDto.attributeIds || [],
        locationTitle: createDto.locationTitle,
        locationUrl: createDto.locationUrl,
        locationGoogleMapsUrl: createDto.locationGoogleMapsUrl,
        street: createDto.street,
        houseNumber: createDto.houseNumber,
        deadlineForCommissioning: createDto.deadlineForCommissioning,
        salesOffice: createDto.salesOffice,
        landCadastralNumber: createDto.landCadastralNumber,
        contractAddress: createDto.contractAddress,
        secondContractAddress: createDto.secondContractAddress,
        showroomAvailability: createDto.showroomAvailability,
        secondShowroomAvailability: createDto.secondShowroomAvailability,
      },
      include: { category: true, owner: true, roomOption: true },
    });

    await this.syncCategoryMetrics(createDto.categoryId);
    return house;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    categoryId?: string;
    categorySlug?: string;
    status?: 'available' | 'reserved' | 'sold';
    search?: string;
    archived?: boolean;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (query.categoryId) where.categoryId = query.categoryId;

    if (query.categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: query.categorySlug },
      });
      if (category) where.categoryId = category.id;
    }

    if (query.status) where.status = query.status;
    if (query.archived !== undefined) where.archived = query.archived;

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
        { street: { contains: query.search, mode: 'insensitive' } },
        { houseNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.house.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          roomOption: true,
          owner: true,
          _count: { select: { unitLayouts: true } },
        },
      }),
      this.prisma.house.count({ where }),
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
    const house = await this.prisma.house.findUnique({
      where: { id },
      include: {
        category: true,
        roomOption: true,
        owner: true,
        unitLayouts: true,
      },
    });

    if (!house) {
      throw new NotFoundException('House not found');
    }

    return house;
  }

  async findBySlug(slug: string) {
    const house = await this.prisma.house.findUnique({
      where: { slug },
      include: {
        category: true,
        roomOption: true,
        owner: true,
        unitLayouts: true,
      },
    });

    if (!house) {
      throw new NotFoundException('House not found');
    }

    return house;
  }

  async update(id: string, updateDto: UpdateHouseDto) {
    const existing = await this.prisma.house.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('House not found');
    }

    if (updateDto.slug && updateDto.slug !== existing.slug) {
      const slugExists = await this.prisma.house.findUnique({
        where: { slug: updateDto.slug },
      });
      if (slugExists) {
        throw new ConflictException('House with this slug already exists');
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
    if (updateDto.roomOptionId !== undefined) data.roomOptionId = updateDto.roomOptionId;
    if (updateDto.floor !== undefined) data.floor = updateDto.floor;
    if (updateDto.number !== undefined) data.number = updateDto.number;
    if (updateDto.totalArea !== undefined) data.totalArea = updateDto.totalArea;
    if (updateDto.internalArea !== undefined) data.internalArea = updateDto.internalArea;
    if (updateDto.balconyArea !== undefined) data.balconyArea = updateDto.balconyArea;
    if (updateDto.prices !== undefined) data.prices = updateDto.prices;
    if (updateDto.completionYear !== undefined) data.completionYear = updateDto.completionYear;
    if (updateDto.numberOfFloors !== undefined) data.numberOfFloors = updateDto.numberOfFloors;
    if (updateDto.similarApartmentIds !== undefined) data.similarApartmentIds = updateDto.similarApartmentIds;
    if (updateDto.mainImage !== undefined) data.mainImage = updateDto.mainImage;
    if (updateDto.coverImage !== undefined) data.coverImage = updateDto.coverImage;
    if (updateDto.gallery !== undefined) data.gallery = updateDto.gallery;
    if (updateDto.documents !== undefined) data.documents = updateDto.documents;
    if (updateDto.location !== undefined) data.location = updateDto.location;
    if (updateDto.typeOfBuilding !== undefined) data.typeOfBuilding = updateDto.typeOfBuilding;
    if (updateDto.constructionStage !== undefined) data.constructionStage = updateDto.constructionStage;
    if (updateDto.startOfConstruction !== undefined) data.startOfConstruction = updateDto.startOfConstruction;
    if (updateDto.completionOfConstruction !== undefined) data.completionOfConstruction = updateDto.completionOfConstruction;
    if (updateDto.startOfSales !== undefined) data.startOfSales = updateDto.startOfSales;
    if (updateDto.endOfSales !== undefined) data.endOfSales = updateDto.endOfSales;
    if (updateDto.description !== undefined) data.description = updateDto.description;
    if (updateDto.ownerId !== undefined) data.ownerId = updateDto.ownerId;
    if (updateDto.heatingTypeIds !== undefined) data.heatingTypeIds = updateDto.heatingTypeIds;
    if (updateDto.attributeIds !== undefined) data.attributeIds = updateDto.attributeIds;
    if (updateDto.locationTitle !== undefined) data.locationTitle = updateDto.locationTitle;
    if (updateDto.locationUrl !== undefined) data.locationUrl = updateDto.locationUrl;
    if (updateDto.locationGoogleMapsUrl !== undefined) data.locationGoogleMapsUrl = updateDto.locationGoogleMapsUrl;
    if (updateDto.street !== undefined) data.street = updateDto.street;
    if (updateDto.houseNumber !== undefined) data.houseNumber = updateDto.houseNumber;
    if (updateDto.deadlineForCommissioning !== undefined) data.deadlineForCommissioning = updateDto.deadlineForCommissioning;
    if (updateDto.salesOffice !== undefined) data.salesOffice = updateDto.salesOffice;
    if (updateDto.landCadastralNumber !== undefined) data.landCadastralNumber = updateDto.landCadastralNumber;
    if (updateDto.contractAddress !== undefined) data.contractAddress = updateDto.contractAddress;
    if (updateDto.secondContractAddress !== undefined) data.secondContractAddress = updateDto.secondContractAddress;
    if (updateDto.showroomAvailability !== undefined) data.showroomAvailability = updateDto.showroomAvailability;
    if (updateDto.secondShowroomAvailability !== undefined) data.secondShowroomAvailability = updateDto.secondShowroomAvailability;

    const house = await this.prisma.house.update({
      where: { id },
      data,
      include: { category: true, roomOption: true, owner: true },
    });

    await this.syncCategoryMetrics(house.categoryId);
    if (existing.categoryId !== house.categoryId) {
      await this.syncCategoryMetrics(existing.categoryId);
    }

    return house;
  }

  async remove(id: string) {
    const existing = await this.prisma.house.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('House not found');
    }

    await this.prisma.unitLayout.updateMany({
      where: { houseId: id },
      data: { houseId: null },
    });

    const result = await this.prisma.house.delete({
      where: { id },
    });

    await this.syncCategoryMetrics(existing.categoryId);
    return result;
  }

  async countByStatus() {
    const [available, sold, reserved] = await Promise.all([
      this.prisma.house.count({ where: { status: 'available', archived: false } }),
      this.prisma.house.count({ where: { status: 'sold', archived: false } }),
      this.prisma.house.count({ where: { status: 'reserved', archived: false } }),
    ]);

    return { available, sold, reserved, total: available + sold + reserved };
  }
}
