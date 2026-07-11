import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationOptionDto } from './dto/create-location-option.dto';
import { UpdateLocationOptionDto } from './dto/update-location-option.dto';

@Injectable()
export class LocationOptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateLocationOptionDto) {
    const existing = await this.prisma.locationOption.findUnique({
      where: { type_name: { type: createDto.type, name: createDto.name } },
    });

    if (existing) {
      throw new ConflictException('Location option with this type and name already exists');
    }

    return this.prisma.locationOption.create({ data: createDto });
  }

  async findAll(type?: string) {
    return this.prisma.locationOption.findMany({
      where: type ? { type } : undefined,
      orderBy: [{ type: 'asc' }, { title: 'asc' }],
    });
  }

  async findOne(id: string) {
    const option = await this.prisma.locationOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('Location option not found');
    return option;
  }

  async update(id: string, updateDto: UpdateLocationOptionDto) {
    const option = await this.prisma.locationOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('Location option not found');

    const nextType = updateDto.type ?? option.type;
    const nextName = updateDto.name ?? option.name;

    if (nextType !== option.type || nextName !== option.name) {
      const existing = await this.prisma.locationOption.findUnique({
        where: { type_name: { type: nextType, name: nextName } },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Another location option with this type and name already exists');
      }
    }

    return this.prisma.locationOption.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    const option = await this.prisma.locationOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('Location option not found');
    return this.prisma.locationOption.delete({ where: { id } });
  }
}
