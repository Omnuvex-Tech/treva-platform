import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationOptionDto } from './dto/create-location-option.dto';
import { UpdateLocationOptionDto } from './dto/update-location-option.dto';

@Injectable()
export class LocationOptionsService {
  constructor(private prisma: PrismaService) {}

  private async validateCityAssignment(type: string, cityId?: string | null) {
    if (type === 'region') {
      if (!cityId) {
        throw new ConflictException('City is required for region options');
      }

      const city = await this.prisma.locationOption.findUnique({
        where: { id: cityId },
      });

      if (!city || city.type !== 'city') {
        throw new NotFoundException('Selected city was not found');
      }

      return cityId;
    }

    return null;
  }

  async create(createDto: CreateLocationOptionDto) {
    const cityId = await this.validateCityAssignment(createDto.type, createDto.cityId);
    const existing = await this.prisma.locationOption.findUnique({
      where: { type_name: { type: createDto.type, name: createDto.name } },
    });

    if (existing) {
      throw new ConflictException('Location option with this type and name already exists');
    }

    return this.prisma.locationOption.create({
      data: {
        ...createDto,
        cityId,
      },
      include: {
        city: true,
      },
    });
  }

  async findAll(type?: string) {
    return this.prisma.locationOption.findMany({
      where: type ? { type } : undefined,
      orderBy: [{ type: 'asc' }, { title: 'asc' }],
      include: {
        city: true,
      },
    });
  }

  async findOne(id: string) {
    const option = await this.prisma.locationOption.findUnique({
      where: { id },
      include: {
        city: true,
      },
    });
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

    const nextCityId = await this.validateCityAssignment(nextType, updateDto.cityId ?? option.cityId);

    if (option.type === 'city' && nextType !== 'city') {
      const regionCount = await this.prisma.locationOption.count({
        where: {
          cityId: option.id,
        },
      });

      if (regionCount > 0) {
        throw new ConflictException('City with attached regions cannot be converted');
      }
    }

    return this.prisma.locationOption.update({
      where: { id },
      data: {
        ...updateDto,
        cityId: nextCityId,
      },
      include: {
        city: true,
      },
    });
  }

  async remove(id: string) {
    const option = await this.prisma.locationOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('Location option not found');

    if (option.type === 'city') {
      const regionCount = await this.prisma.locationOption.count({
        where: {
          cityId: option.id,
        },
      });

      if (regionCount > 0) {
        throw new ConflictException('Delete attached regions before deleting this city');
      }
    }

    return this.prisma.locationOption.delete({ where: { id } });
  }
}
