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
      data: createCategoryDto,
    });
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        unitLayouts: {
          include: {
            statusOption: true,
          },
        },
      },
    });

    return categories.map((category) => {
      const unitLayouts = category.unitLayouts;
      const total = unitLayouts.length;
      const sold = unitLayouts.filter(
        (u) => u.statusOption?.value?.toLowerCase() === 'sold',
      ).length;
      const reserved = unitLayouts.filter(
        (u) => u.statusOption?.value?.toLowerCase() === 'reserved',
      ).length;
      const available = total - sold - reserved;

      const { unitLayouts: _unitLayouts, ...categoryData } = category;
      return {
        ...categoryData,
        metrics: {
          houses: total,
          properties: total,
          reserved,
          sold,
          available,
        },
      };
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        unitLayouts: {
          include: {
            statusOption: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const unitLayouts = category.unitLayouts;
    const total = unitLayouts.length;
    const sold = unitLayouts.filter(
      (u) => u.statusOption?.value?.toLowerCase() === 'sold',
    ).length;
    const reserved = unitLayouts.filter(
      (u) => u.statusOption?.value?.toLowerCase() === 'reserved',
    ).length;
    const available = total - sold - reserved;

    const { unitLayouts: _unitLayouts, ...categoryData } = category;
    return {
      ...categoryData,
      metrics: {
        houses: total,
        properties: total,
        reserved,
        sold,
        available,
      },
    };
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        unitLayouts: {
          include: {
            statusOption: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const unitLayouts = category.unitLayouts;
    const total = unitLayouts.length;
    const sold = unitLayouts.filter(
      (u) => u.statusOption?.value?.toLowerCase() === 'sold',
    ).length;
    const reserved = unitLayouts.filter(
      (u) => u.statusOption?.value?.toLowerCase() === 'reserved',
    ).length;
    const available = total - sold - reserved;

    const { unitLayouts: _unitLayouts, ...categoryData } = category;
    return {
      ...categoryData,
      metrics: {
        houses: total,
        properties: total,
        reserved,
        sold,
        available,
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
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
