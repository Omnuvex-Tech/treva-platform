import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStatusOptionDto } from './dto/create-status-option.dto';
import { UpdateStatusOptionDto } from './dto/update-status-option.dto';

@Injectable()
export class StatusOptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateStatusOptionDto) {
    const existing = await this.prisma.statusOption.findUnique({
      where: { value: createDto.value },
    });
    if (existing) {
      throw new ConflictException('Status option with this value already exists');
    }
    return this.prisma.statusOption.create({
      data: { value: createDto.value, order: createDto.order ?? 0 },
    });
  }

  async findAll() {
    return this.prisma.statusOption.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const option = await this.prisma.statusOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('Status option not found');
    return option;
  }

  async update(id: string, updateDto: UpdateStatusOptionDto) {
    await this.findOne(id);
    if (updateDto.value) {
      const existing = await this.prisma.statusOption.findFirst({
        where: { value: updateDto.value, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Another status option has this value');
      }
    }
    return this.prisma.statusOption.update({
      where: { id },
      data: {
        ...(updateDto.value && { value: updateDto.value }),
        ...(updateDto.order !== undefined && { order: updateDto.order }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.statusOption.delete({ where: { id } });
  }
}
