import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { RoomOptionsService } from './room-options.service';
import { CreateRoomOptionDto } from './dto/create-room-option.dto';
import { UpdateRoomOptionDto } from './dto/update-room-option.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('room-options')
export class RoomOptionsController {
  constructor(private readonly roomOptionsService: RoomOptionsService) {}

  @Get()
  findAll(@Query('type') type?: string) {
    return this.roomOptionsService.findAll(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomOptionsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createRoomOptionDto: CreateRoomOptionDto) {
    return this.roomOptionsService.create(createRoomOptionDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateRoomOptionDto: UpdateRoomOptionDto) {
    return this.roomOptionsService.update(id, updateRoomOptionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.roomOptionsService.remove(id);
  }
}
