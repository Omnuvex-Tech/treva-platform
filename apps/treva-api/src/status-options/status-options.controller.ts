import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { StatusOptionsService } from './status-options.service';
import { CreateStatusOptionDto } from './dto/create-status-option.dto';
import { UpdateStatusOptionDto } from './dto/update-status-option.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('status-options')
@Controller('status-options')
export class StatusOptionsController {
  constructor(private readonly statusOptionsService: StatusOptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new status option' })
  create(@Body() createDto: CreateStatusOptionDto) {
    return this.statusOptionsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all status options' })
  findAll() {
    return this.statusOptionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a status option by ID' })
  findOne(@Param('id') id: string) {
    return this.statusOptionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a status option' })
  update(@Param('id') id: string, @Body() updateDto: UpdateStatusOptionDto) {
    return this.statusOptionsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a status option' })
  remove(@Param('id') id: string) {
    return this.statusOptionsService.remove(id);
  }
}
