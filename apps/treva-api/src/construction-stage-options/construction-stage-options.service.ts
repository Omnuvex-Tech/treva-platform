import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConstructionStageOptionDto } from './dto/create-construction-stage-option.dto';
import { UpdateConstructionStageOptionDto } from './dto/update-construction-stage-option.dto';

@Injectable()
export class ConstructionStageOptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateConstructionStageOptionDto) {
    const existing = await this.prisma.constructionStageOption.findUnique({
      where: { value: createDto.value },
    });
    if (existing) {
      throw new ConflictException('Construction stage option with this value already exists');
    }
    return this.prisma.constructionStageOption.create({
      data: { value: createDto.value },
    });
  }

  async findAll() {
    return this.prisma.constructionStageOption.findMany({ orderBy: { value: 'asc' } });
  }

  async findOne(id: string) {
    const option = await this.prisma.constructionStageOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('Construction stage option not found');
    return option;
  }

  async update(id: string, updateDto: UpdateConstructionStageOptionDto) {
    await this.findOne(id);
    if (updateDto.value) {
      const existing = await this.prisma.constructionStageOption.findFirst({
        where: { value: updateDto.value, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Another construction stage option has this value');
      }
    }
    return this.prisma.constructionStageOption.update({
      where: { id },
      data: {
        ...(updateDto.value && { value: updateDto.value }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.constructionStageOption.delete({ where: { id } });
  }
}
