import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UnitTypeOptionsService } from './unit-type-options.service';
import { CreateUnitTypeOptionDto } from './dto/create-unit-type-option.dto';
import { UpdateUnitTypeOptionDto } from './dto/update-unit-type-option.dto';

@ApiTags('unit-type-options')
@Controller('unit-type-options')
export class UnitTypeOptionsController {
  constructor(private readonly service: UnitTypeOptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new unit type option' })
  create(@Body() createDto: CreateUnitTypeOptionDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all unit type options' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a unit type option by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a unit type option' })
  update(@Param('id') id: string, @Body() updateDto: UpdateUnitTypeOptionDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a unit type option' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
