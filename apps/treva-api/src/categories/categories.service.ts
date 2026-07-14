import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug: createCategoryDto.slug },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this slug already exists');
    }

    return this.prisma.category.create({
      data: { ...createCategoryDto, documents: createCategoryDto.documents as any },
    });
  }

  async findAll(type?: string) {
    const where = type ? { type } : {};
    const categories = await this.prisma.category.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return categories.map((category) => ({
      id: category.id,
      title: category.title,
      name: category.name,
      slug: category.slug,
      image: category.image,
      coverImage: category.coverImage,
      status: category.status,
      type: category.type,
      housesCount: category.housesCount,
      propertiesCount: category.propertiesCount,
      reservedCount: category.reservedCount,
      soldCount: category.soldCount,
      objectType: category.objectType,
      propertyName: category.propertyName,
      currency: category.currency,
      region: category.region,
      area: category.area,
      city: category.city,
      developerBrand: category.developerBrand,
      website: category.website,
      banks: category.banks,
      infrastructure: category.infrastructure,
      salesDepartment: category.salesDepartment,
      documents: category.documents,
      fedLaw214: category.fedLaw214,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      metrics: {
        houses: category.housesCount,
        properties: category.propertiesCount,
        reserved: category.reservedCount,
        sold: category.soldCount,
        available: category.propertiesCount - category.reservedCount - category.soldCount,
      },
    }));
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      id: category.id,
      title: category.title,
      name: category.name,
      slug: category.slug,
      image: category.image,
      coverImage: category.coverImage,
      status: category.status,
      type: category.type,
      housesCount: category.housesCount,
      propertiesCount: category.propertiesCount,
      reservedCount: category.reservedCount,
      soldCount: category.soldCount,
      objectType: category.objectType,
      propertyName: category.propertyName,
      currency: category.currency,
      region: category.region,
      area: category.area,
      city: category.city,
      developerBrand: category.developerBrand,
      website: category.website,
      banks: category.banks,
      infrastructure: category.infrastructure,
      salesDepartment: category.salesDepartment,
      documents: category.documents,
      fedLaw214: category.fedLaw214,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      metrics: {
        houses: category.housesCount,
        properties: category.propertiesCount,
        reserved: category.reservedCount,
        sold: category.soldCount,
        available: category.propertiesCount - category.reservedCount - category.soldCount,
      },
    };
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      id: category.id,
      title: category.title,
      name: category.name,
      slug: category.slug,
      image: category.image,
      coverImage: category.coverImage,
      status: category.status,
      type: category.type,
      housesCount: category.housesCount,
      propertiesCount: category.propertiesCount,
      reservedCount: category.reservedCount,
      soldCount: category.soldCount,
      objectType: category.objectType,
      propertyName: category.propertyName,
      currency: category.currency,
      region: category.region,
      area: category.area,
      city: category.city,
      developerBrand: category.developerBrand,
      website: category.website,
      banks: category.banks,
      infrastructure: category.infrastructure,
      salesDepartment: category.salesDepartment,
      documents: category.documents,
      fedLaw214: category.fedLaw214,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      metrics: {
        houses: category.housesCount,
        properties: category.propertiesCount,
        reserved: category.reservedCount,
        sold: category.soldCount,
        available: category.propertiesCount - category.reservedCount - category.soldCount,
      },
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingCategory = await this.prisma.category.findUnique({
        where: { slug: updateCategoryDto.slug },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: { ...updateCategoryDto, documents: updateCategoryDto.documents as any },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.prisma.unitLayout.deleteMany({
      where: { categoryId: id },
    });

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
