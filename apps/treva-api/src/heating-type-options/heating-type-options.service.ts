import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHeatingTypeOptionDto } from './dto/create-heating-type-option.dto';
import { UpdateHeatingTypeOptionDto } from './dto/update-heating-type-option.dto';

@Injectable()
export class HeatingTypeOptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateHeatingTypeOptionDto) {
    const existing = await this.prisma.heatingTypeOption.findUnique({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new ConflictException('Heating type with this name already exists');
    }

    return this.prisma.heatingTypeOption.create({
      data: {
        name: createDto.name,
        title: createDto.title,
      },
    });
  }

  async findAll() {
    return this.prisma.heatingTypeOption.findMany({
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: string) {
    const option = await this.prisma.heatingTypeOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('Heating type not found');
    return option;
  }

  async update(id: string, updateDto: UpdateHeatingTypeOptionDto) {
    await this.findOne(id);

    if (updateDto.name) {
      const existing = await this.prisma.heatingTypeOption.findFirst({
        where: { name: updateDto.name, NOT: { id } },
      });

      if (existing) {
        throw new ConflictException('Another heating type has this name');
      }
    }

    return this.prisma.heatingTypeOption.update({
      where: { id },
      data: {
        ...(updateDto.name !== undefined && { name: updateDto.name }),
        ...(updateDto.title !== undefined && { title: updateDto.title }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.heatingTypeOption.delete({ where: { id } });
  }
}
