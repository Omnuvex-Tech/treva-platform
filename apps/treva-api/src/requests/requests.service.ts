import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRequestDto) {
    return this.prisma.request.create({ data: dto });
  }

  async findAll() {
    return this.prisma.request.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const req = await this.prisma.request.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Request not found');
    return req;
  }

  async update(id: string, dto: UpdateRequestDto) {
    const req = await this.prisma.request.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Request not found');
    return this.prisma.request.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const req = await this.prisma.request.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Request not found');
    return this.prisma.request.delete({ where: { id } });
  }
}
