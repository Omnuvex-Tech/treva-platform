import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLcdOptionDto } from './dto/create-lcd-option.dto';
import { UpdateLcdOptionDto } from './dto/update-lcd-option.dto';

@Injectable()
export class LcdOptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateLcdOptionDto) {
    const existing = await this.prisma.lcdOption.findUnique({
      where: { value: createDto.value },
    });
    if (existing) {
      throw new ConflictException('LCD option with this value already exists');
    }
    return this.prisma.lcdOption.create({
      data: { value: createDto.value },
    });
  }

  async findAll() {
    return this.prisma.lcdOption.findMany({ orderBy: { value: 'asc' } });
  }

  async findOne(id: string) {
    const option = await this.prisma.lcdOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('LCD option not found');
    return option;
  }

  async update(id: string, updateDto: UpdateLcdOptionDto) {
    await this.findOne(id);
    if (updateDto.value) {
      const existing = await this.prisma.lcdOption.findFirst({
        where: { value: updateDto.value, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Another LCD option has this value');
      }
    }
    return this.prisma.lcdOption.update({
      where: { id },
      data: {
        ...(updateDto.value && { value: updateDto.value }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.lcdOption.delete({ where: { id } });
  }
}
