import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateViewOptionDto } from './dto/create-view-option.dto';
import { UpdateViewOptionDto } from './dto/update-view-option.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ViewOptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateViewOptionDto) {
    const existing = await this.prisma.viewOption.findUnique({
      where: { value: createDto.value },
    });
    if (existing) {
      throw new ConflictException('View option with this value already exists');
    }
    return this.prisma.viewOption.create({
      data: {
        value: createDto.value,
        order: createDto.order ?? 0,
      },
    });
  }

  async findAll() {
    return this.prisma.viewOption.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const option = await this.prisma.viewOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('View option not found');
    return option;
  }

  async update(id: string, updateDto: UpdateViewOptionDto) {
    await this.findOne(id); // verify existence

    if (updateDto.value) {
      const existing = await this.prisma.viewOption.findFirst({
        where: { value: updateDto.value, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Another view option has this value');
      }
    }

    return this.prisma.viewOption.update({
      where: { id },
      data: {
        ...(updateDto.value && { value: updateDto.value }),
        ...(updateDto.order !== undefined && { order: updateDto.order }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.viewOption.delete({ where: { id } });
  }
}
