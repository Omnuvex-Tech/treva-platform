import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomOptionDto } from './dto/create-room-option.dto';
import { UpdateRoomOptionDto } from './dto/update-room-option.dto';

@Injectable()
export class RoomOptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomOptionDto: CreateRoomOptionDto) {
    const type = createRoomOptionDto.type || 'off-plan';
    const existing = await this.prisma.roomOption.findUnique({
      where: { value_type: { value: createRoomOptionDto.value, type } },
    });

    if (existing) {
      throw new ConflictException('RoomOption with this value and type already exists');
    }

    return this.prisma.roomOption.create({
      data: { ...createRoomOptionDto, type },
    });
  }

  async findAll(type?: string) {
    return this.prisma.roomOption.findMany({
      where: type ? { type } : undefined,
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

    const newValue = updateRoomOptionDto.value ?? roomOption.value;
    const newType = updateRoomOptionDto.type ?? roomOption.type;

    if (newValue !== roomOption.value || newType !== roomOption.type) {
      const existing = await this.prisma.roomOption.findUnique({
        where: { value_type: { value: newValue, type: newType } },
      });

      if (existing) {
        throw new ConflictException('RoomOption with this value and type already exists');
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
