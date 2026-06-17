import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';

@Injectable()
export class OwnersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOwnerDto) {
    return this.prisma.owner.create({ data: dto });
  }

  async findAll() {
    return this.prisma.owner.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const owner = await this.prisma.owner.findUnique({ where: { id } });
    if (!owner) throw new NotFoundException('Owner not found');
    return owner;
  }

  async update(id: string, dto: UpdateOwnerDto) {
    const owner = await this.prisma.owner.findUnique({ where: { id } });
    if (!owner) throw new NotFoundException('Owner not found');
    return this.prisma.owner.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const owner = await this.prisma.owner.findUnique({ where: { id } });
    if (!owner) throw new NotFoundException('Owner not found');
    return this.prisma.owner.delete({ where: { id } });
  }
}
