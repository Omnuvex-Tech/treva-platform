import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTypeOfBuildingOptionDto } from './dto/create-type-of-building-option.dto';
import { UpdateTypeOfBuildingOptionDto } from './dto/update-type-of-building-option.dto';

@Injectable()
export class TypeOfBuildingOptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateTypeOfBuildingOptionDto) {
    const existing = await this.prisma.typeOfBuildingOption.findUnique({
      where: { value: createDto.value },
    });
    if (existing) {
      throw new ConflictException('Type of building option with this value already exists');
    }
    return this.prisma.typeOfBuildingOption.create({
      data: { value: createDto.value, order: createDto.order ?? 0 },
    });
  }

  async findAll() {
    return this.prisma.typeOfBuildingOption.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const option = await this.prisma.typeOfBuildingOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('Type of building option not found');
    return option;
  }

  async update(id: string, updateDto: UpdateTypeOfBuildingOptionDto) {
    await this.findOne(id);
    if (updateDto.value) {
      const existing = await this.prisma.typeOfBuildingOption.findFirst({
        where: { value: updateDto.value, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Another type of building option has this value');
      }
    }
    return this.prisma.typeOfBuildingOption.update({
      where: { id },
      data: {
        ...(updateDto.value && { value: updateDto.value }),
        ...(updateDto.order !== undefined && { order: updateDto.order }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.typeOfBuildingOption.delete({ where: { id } });
  }
}
