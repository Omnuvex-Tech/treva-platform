import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateViewOptionDto } from './dto/create-view-option.dto';
import { UpdateViewOptionDto } from './dto/update-view-option.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ViewOptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateViewOptionDto) {
    const existing = await this.prisma.viewOption.findUnique({
      where: { name: createDto.name },
    });
    if (existing) {
      throw new ConflictException('View option with this name already exists');
    }
    return this.prisma.viewOption.create({
      data: {
        name: createDto.name,
        title: createDto.title,
      },
    });
  }

  async findAll() {
    return this.prisma.viewOption.findMany({
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: string) {
    const option = await this.prisma.viewOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('View option not found');
    return option;
  }

  async update(id: string, updateDto: UpdateViewOptionDto) {
    await this.findOne(id); // verify existence

    if (updateDto.name) {
      const existing = await this.prisma.viewOption.findFirst({
        where: { name: updateDto.name, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Another view option has this name');
      }
    }

    return this.prisma.viewOption.update({
      where: { id },
      data: {
        ...(updateDto.name !== undefined && { name: updateDto.name }),
        ...(updateDto.title !== undefined && { title: updateDto.title }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.viewOption.delete({ where: { id } });
  }
}
