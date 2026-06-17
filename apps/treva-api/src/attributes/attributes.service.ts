import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

@Injectable()
export class AttributesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAttributeDto) {
    return this.prisma.attribute.create({ data: dto });
  }

  async findAll() {
    return this.prisma.attribute.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const attr = await this.prisma.attribute.findUnique({ where: { id } });
    if (!attr) throw new NotFoundException('Attribute not found');
    return attr;
  }

  async update(id: string, dto: UpdateAttributeDto) {
    const attr = await this.prisma.attribute.findUnique({ where: { id } });
    if (!attr) throw new NotFoundException('Attribute not found');
    return this.prisma.attribute.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const attr = await this.prisma.attribute.findUnique({ where: { id } });
    if (!attr) throw new NotFoundException('Attribute not found');
    return this.prisma.attribute.delete({ where: { id } });
  }
}
