import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';

@Injectable()
export class ApartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApartmentDto) {
    const existing = await this.prisma.apartment.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Apartment with this slug already exists');
    }
    return this.prisma.apartment.create({ data: dto });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    apartmentTypeId?: string;
    ownerId?: string;
    minPrice?: number;
    maxPrice?: number;
    roomCount?: number;
    minArea?: number;
    maxArea?: number;
    floor?: number;
  }) {
    const { page = 1, limit = 12, apartmentTypeId, ownerId, minPrice, maxPrice, roomCount, minArea, maxArea, floor } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (apartmentTypeId) where.apartmentTypeId = apartmentTypeId;
    if (ownerId) where.ownerId = ownerId;
    if (roomCount) where.roomCount = roomCount;
    if (minPrice || maxPrice) {
      where.priceTotal = {};
      if (minPrice) where.priceTotal.gte = minPrice;
      if (maxPrice) where.priceTotal.lte = maxPrice;
    }
    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area.gte = minArea;
      if (maxArea) where.area.lte = maxArea;
    }
    if (floor) {
      where.floorFrom = { lte: floor };
      where.floorTo = { gte: floor };
    }

    const [data, total] = await Promise.all([
      this.prisma.apartment.findMany({
        where,
        include: { apartmentType: true, owner: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.apartment.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id },
      include: { apartmentType: true, owner: true },
    });
    if (!apartment) throw new NotFoundException('Apartment not found');
    return apartment;
  }

  async findBySlug(slug: string) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { slug },
      include: { apartmentType: true, owner: true },
    });
    if (!apartment) throw new NotFoundException('Apartment not found');
    return apartment;
  }

  async update(id: string, dto: UpdateApartmentDto) {
    const apartment = await this.prisma.apartment.findUnique({ where: { id } });
    if (!apartment) throw new NotFoundException('Apartment not found');

    if (dto.slug && dto.slug !== apartment.slug) {
      const existing = await this.prisma.apartment.findUnique({ where: { slug: dto.slug } });
      if (existing) throw new ConflictException('Apartment with this slug already exists');
    }

    return this.prisma.apartment.update({
      where: { id },
      data: dto,
      include: { apartmentType: true, owner: true },
    });
  }

  async remove(id: string) {
    const apartment = await this.prisma.apartment.findUnique({ where: { id } });
    if (!apartment) throw new NotFoundException('Apartment not found');
    return this.prisma.apartment.delete({ where: { id } });
  }

  async getRange() {
    const result = await this.prisma.apartment.aggregate({
      _max: { priceTotal: true, area: true },
      _min: { priceTotal: true, area: true },
    });
    return {
      maxPrice: result._max.priceTotal ?? 0,
      minPrice: result._min.priceTotal ?? 0,
      maxTotalArea: result._max.area ?? 0,
      minTotalArea: result._min.area ?? 0,
    };
  }
}
