import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyTypeOptionDto } from './dto/create-property-type-option.dto';
import { UpdatePropertyTypeOptionDto } from './dto/update-property-type-option.dto';

@Injectable()
export class PropertyTypeOptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreatePropertyTypeOptionDto) {
    const existing = await this.prisma.propertyTypeOption.findUnique({
      where: { value: createDto.value },
    });
    if (existing) {
      throw new ConflictException('Property type option with this value already exists');
    }
    return this.prisma.propertyTypeOption.create({
      data: { value: createDto.value, order: createDto.order ?? 0 },
    });
  }

  async findAll() {
    return this.prisma.propertyTypeOption.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const option = await this.prisma.propertyTypeOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('Property type option not found');
    return option;
  }

  async update(id: string, updateDto: UpdatePropertyTypeOptionDto) {
    await this.findOne(id);
    if (updateDto.value) {
      const existing = await this.prisma.propertyTypeOption.findFirst({
        where: { value: updateDto.value, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Another property type option has this value');
      }
    }
    return this.prisma.propertyTypeOption.update({
      where: { id },
      data: {
        ...(updateDto.value && { value: updateDto.value }),
        ...(updateDto.order !== undefined && { order: updateDto.order }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.propertyTypeOption.delete({ where: { id } });
  }
}
