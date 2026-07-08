import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ObjectTypesService } from './object-types.service';
import { CreateObjectTypeDto } from './dto/create-object-type.dto';
import { UpdateObjectTypeDto } from './dto/update-object-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('object-types')
@Controller('object-types')
export class ObjectTypesController {
  constructor(private readonly service: ObjectTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create object type' })
  async create(@Body() dto: CreateObjectTypeDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all object types' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get object type by ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update object type' })
  async update(@Param('id') id: string, @Body() dto: UpdateObjectTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete object type' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
