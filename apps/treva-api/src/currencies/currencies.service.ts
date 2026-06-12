import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

@Injectable()
export class CurrenciesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCurrencyDto) {
    const existing = await this.prisma.currency.findUnique({
      where: { value: createDto.value },
    });

    if (existing) {
      throw new ConflictException('Currency with this value already exists');
    }

    return this.prisma.currency.create({ data: createDto });
  }

  async findAll() {
    return this.prisma.currency.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const currency = await this.prisma.currency.findUnique({ where: { id } });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }
    return currency;
  }

  async update(id: string, updateDto: UpdateCurrencyDto) {
    const currency = await this.prisma.currency.findUnique({ where: { id } });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }

    if (updateDto.value && updateDto.value !== currency.value) {
      const existing = await this.prisma.currency.findUnique({
        where: { value: updateDto.value },
      });
      if (existing) {
        throw new ConflictException('Currency with this value already exists');
      }
    }

    return this.prisma.currency.update({ where: { id }, data: updateDto });
  }

  async remove(id: string) {
    const currency = await this.prisma.currency.findUnique({ where: { id } });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }
    return this.prisma.currency.delete({ where: { id } });
  }
}
