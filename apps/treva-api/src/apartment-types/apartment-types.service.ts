import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApartmentTypeDto } from './dto/create-apartment-type.dto';
import { UpdateApartmentTypeDto } from './dto/update-apartment-type.dto';

@Injectable()
export class ApartmentTypesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApartmentTypeDto) {
    const existing = await this.prisma.apartmentType.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('ApartmentType with this slug already exists');
    }
    return this.prisma.apartmentType.create({ data: dto });
  }

  async findAll() {
    return this.prisma.apartmentType.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const type = await this.prisma.apartmentType.findUnique({ where: { id } });
    if (!type) throw new NotFoundException('ApartmentType not found');
    return type;
  }

  async update(id: string, dto: UpdateApartmentTypeDto) {
    const type = await this.prisma.apartmentType.findUnique({ where: { id } });
    if (!type) throw new NotFoundException('ApartmentType not found');

    if (dto.slug && dto.slug !== type.slug) {
      const existing = await this.prisma.apartmentType.findUnique({ where: { slug: dto.slug } });
      if (existing) throw new ConflictException('ApartmentType with this slug already exists');
    }

    return this.prisma.apartmentType.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const type = await this.prisma.apartmentType.findUnique({ where: { id } });
    if (!type) throw new NotFoundException('ApartmentType not found');
    return this.prisma.apartmentType.delete({ where: { id } });
  }
}
