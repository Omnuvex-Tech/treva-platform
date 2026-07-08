import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateObjectTypeDto } from './dto/create-object-type.dto';
import { UpdateObjectTypeDto } from './dto/update-object-type.dto';

@Injectable()
export class ObjectTypesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateObjectTypeDto) {
    const existing = await this.prisma.objectType.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('ObjectType with this slug already exists');
    }
    return this.prisma.objectType.create({ data: dto });
  }

  async findAll() {
    return this.prisma.objectType.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const type = await this.prisma.objectType.findUnique({ where: { id } });
    if (!type) throw new NotFoundException('ObjectType not found');
    return type;
  }

  async update(id: string, dto: UpdateObjectTypeDto) {
    const type = await this.prisma.objectType.findUnique({ where: { id } });
    if (!type) throw new NotFoundException('ObjectType not found');

    if (dto.slug && dto.slug !== type.slug) {
      const existing = await this.prisma.objectType.findUnique({ where: { slug: dto.slug } });
      if (existing) throw new ConflictException('ObjectType with this slug already exists');
    }

    return this.prisma.objectType.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const type = await this.prisma.objectType.findUnique({ where: { id } });
    if (!type) throw new NotFoundException('ObjectType not found');
    return this.prisma.objectType.delete({ where: { id } });
  }
}
