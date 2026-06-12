import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoomOptionsService } from './room-options.service';
import { CreateRoomOptionDto } from './dto/create-room-option.dto';
import { UpdateRoomOptionDto } from './dto/update-room-option.dto';

@Controller('room-options')
export class RoomOptionsController {
  constructor(private readonly roomOptionsService: RoomOptionsService) {}

  @Post()
  create(@Body() createRoomOptionDto: CreateRoomOptionDto) {
    return this.roomOptionsService.create(createRoomOptionDto);
  }

  @Get()
  findAll() {
    return this.roomOptionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomOptionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomOptionDto: UpdateRoomOptionDto) {
    return this.roomOptionsService.update(id, updateRoomOptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomOptionsService.remove(id);
  }
}
