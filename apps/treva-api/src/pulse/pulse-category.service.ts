import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePulseCategoryDto } from './dto/create-pulse-category.dto';
import { UpdatePulseCategoryDto } from './dto/update-pulse-category.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

@Injectable()
export class PulseCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePulseCategoryDto) {
    const slug = slugify(dto.name);
    const existing = await this.prisma.pulseCategory.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }
    return this.prisma.pulseCategory.create({ data: { name: dto.name, slug } });
  }

  async findAll() {
    return this.prisma.pulseCategory.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const category = await this.prisma.pulseCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Pulse category not found');
    return category;
  }

  async update(id: string, dto: UpdatePulseCategoryDto) {
    const category = await this.prisma.pulseCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Pulse category not found');

    const data: any = { ...dto };
    if (dto.name) data.slug = slugify(dto.name);

    if (dto.name && dto.name !== category.name) {
      const existing = await this.prisma.pulseCategory.findUnique({ where: { slug: data.slug } });
      if (existing) throw new ConflictException('Category with this name already exists');
    }

    return this.prisma.pulseCategory.update({ where: { id }, data });
  }

  async remove(id: string) {
    const category = await this.prisma.pulseCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Pulse category not found');
    return this.prisma.pulseCategory.delete({ where: { id } });
  }
}
