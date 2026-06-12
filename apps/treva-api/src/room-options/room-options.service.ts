import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomOptionDto } from './dto/create-room-option.dto';
import { UpdateRoomOptionDto } from './dto/update-room-option.dto';

@Injectable()
export class RoomOptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomOptionDto: CreateRoomOptionDto) {
    const existing = await this.prisma.roomOption.findUnique({
      where: { value: createRoomOptionDto.value },
    });

    if (existing) {
      throw new ConflictException('RoomOption with this value already exists');
    }

    return this.prisma.roomOption.create({
      data: createRoomOptionDto,
    });
  }

  async findAll() {
    return this.prisma.roomOption.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const roomOption = await this.prisma.roomOption.findUnique({
      where: { id },
    });

    if (!roomOption) {
      throw new NotFoundException('RoomOption not found');
    }

    return roomOption;
  }

  async update(id: string, updateRoomOptionDto: UpdateRoomOptionDto) {
    const roomOption = await this.prisma.roomOption.findUnique({
      where: { id },
    });

    if (!roomOption) {
      throw new NotFoundException('RoomOption not found');
    }

    if (updateRoomOptionDto.value && updateRoomOptionDto.value !== roomOption.value) {
      const existing = await this.prisma.roomOption.findUnique({
        where: { value: updateRoomOptionDto.value },
      });

      if (existing) {
        throw new ConflictException('RoomOption with this value already exists');
      }
    }

    return this.prisma.roomOption.update({
      where: { id },
      data: updateRoomOptionDto,
    });
  }

  async remove(id: string) {
    const roomOption = await this.prisma.roomOption.findUnique({
      where: { id },
    });

    if (!roomOption) {
      throw new NotFoundException('RoomOption not found');
    }

    return this.prisma.roomOption.delete({
      where: { id },
    });
  }
}
