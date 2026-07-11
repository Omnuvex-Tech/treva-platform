import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TypeOfBuildingOptionsService } from './type-of-building-options.service';
import { CreateTypeOfBuildingOptionDto } from './dto/create-type-of-building-option.dto';
import { UpdateTypeOfBuildingOptionDto } from './dto/update-type-of-building-option.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('type-of-building-options')
@Controller('type-of-building-options')
export class TypeOfBuildingOptionsController {
  constructor(private readonly service: TypeOfBuildingOptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new type of building option' })
  create(@Body() createDto: CreateTypeOfBuildingOptionDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all type of building options' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a type of building option by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a type of building option' })
  update(@Param('id') id: string, @Body() updateDto: UpdateTypeOfBuildingOptionDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a type of building option' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
