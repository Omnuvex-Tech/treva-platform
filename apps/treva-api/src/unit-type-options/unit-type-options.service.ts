import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitTypeOptionDto } from './dto/create-unit-type-option.dto';
import { UpdateUnitTypeOptionDto } from './dto/update-unit-type-option.dto';

@Injectable()
export class UnitTypeOptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateUnitTypeOptionDto) {
    const existing = await this.prisma.unitTypeOption.findUnique({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new ConflictException('Unit type option with this name already exists');
    }

    return this.prisma.unitTypeOption.create({
      data: { name: createDto.name, title: createDto.title },
    });
  }

  async findAll() {
    return this.prisma.unitTypeOption.findMany({ orderBy: { title: 'asc' } });
  }

  async findOne(id: string) {
    const option = await this.prisma.unitTypeOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('Unit type option not found');
    return option;
  }

  async update(id: string, updateDto: UpdateUnitTypeOptionDto) {
    await this.findOne(id);

    if (updateDto.name) {
      const existing = await this.prisma.unitTypeOption.findFirst({
        where: { name: updateDto.name, NOT: { id } },
      });

      if (existing) {
        throw new ConflictException('Another unit type option has this name');
      }
    }

    return this.prisma.unitTypeOption.update({
      where: { id },
      data: {
        ...(updateDto.name && { name: updateDto.name }),
        ...(updateDto.title && { title: updateDto.title }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.unitTypeOption.delete({ where: { id } });
  }
}
