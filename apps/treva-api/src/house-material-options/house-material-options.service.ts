import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHouseMaterialOptionDto } from './dto/create-house-material-option.dto';
import { UpdateHouseMaterialOptionDto } from './dto/update-house-material-option.dto';

@Injectable()
export class HouseMaterialOptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateHouseMaterialOptionDto) {
    const existing = await this.prisma.houseMaterialOption.findUnique({
      where: { value: createDto.value },
    });
    if (existing) {
      throw new ConflictException('House material option with this value already exists');
    }
    return this.prisma.houseMaterialOption.create({
      data: { value: createDto.value },
    });
  }

  async findAll() {
    return this.prisma.houseMaterialOption.findMany({ orderBy: { value: 'asc' } });
  }

  async findOne(id: string) {
    const option = await this.prisma.houseMaterialOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('House material option not found');
    return option;
  }

  async update(id: string, updateDto: UpdateHouseMaterialOptionDto) {
    await this.findOne(id);
    if (updateDto.value) {
      const existing = await this.prisma.houseMaterialOption.findFirst({
        where: { value: updateDto.value, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Another house material option has this value');
      }
    }
    return this.prisma.houseMaterialOption.update({
      where: { id },
      data: {
        ...(updateDto.value && { value: updateDto.value }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.houseMaterialOption.delete({ where: { id } });
  }
}
