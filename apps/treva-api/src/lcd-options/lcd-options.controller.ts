import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LcdOptionsService } from './lcd-options.service';
import { CreateLcdOptionDto } from './dto/create-lcd-option.dto';
import { UpdateLcdOptionDto } from './dto/update-lcd-option.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('lcd-options')
@Controller('lcd-options')
export class LcdOptionsController {
  constructor(private readonly lcdOptionsService: LcdOptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new LCD option' })
  create(@Body() createDto: CreateLcdOptionDto) {
    return this.lcdOptionsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all LCD options' })
  findAll() {
    return this.lcdOptionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an LCD option by ID' })
  findOne(@Param('id') id: string) {
    return this.lcdOptionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an LCD option' })
  update(@Param('id') id: string, @Body() updateDto: UpdateLcdOptionDto) {
    return this.lcdOptionsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an LCD option' })
  remove(@Param('id') id: string) {
    return this.lcdOptionsService.remove(id);
  }
}
