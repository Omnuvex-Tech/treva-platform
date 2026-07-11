import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalesOfficeOptionDto } from './dto/create-sales-office-option.dto';
import { UpdateSalesOfficeOptionDto } from './dto/update-sales-office-option.dto';

@Injectable()
export class SalesOfficeOptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateSalesOfficeOptionDto) {
    const existing = await this.prisma.salesOfficeOption.findUnique({
      where: { value: createDto.value },
    });
    if (existing) {
      throw new ConflictException('Sales office option with this value already exists');
    }
    return this.prisma.salesOfficeOption.create({
      data: { value: createDto.value, order: createDto.order ?? 0 },
    });
  }

  async findAll() {
    return this.prisma.salesOfficeOption.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const option = await this.prisma.salesOfficeOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('Sales office option not found');
    return option;
  }

  async update(id: string, updateDto: UpdateSalesOfficeOptionDto) {
    await this.findOne(id);
    if (updateDto.value) {
      const existing = await this.prisma.salesOfficeOption.findFirst({
        where: { value: updateDto.value, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Another sales office option has this value');
      }
    }
    return this.prisma.salesOfficeOption.update({
      where: { id },
      data: {
        ...(updateDto.value && { value: updateDto.value }),
        ...(updateDto.order !== undefined && { order: updateDto.order }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.salesOfficeOption.delete({ where: { id } });
  }
}
