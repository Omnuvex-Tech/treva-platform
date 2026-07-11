import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SalesOfficeOptionsService } from './sales-office-options.service';
import { CreateSalesOfficeOptionDto } from './dto/create-sales-office-option.dto';
import { UpdateSalesOfficeOptionDto } from './dto/update-sales-office-option.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('sales-office-options')
@Controller('sales-office-options')
export class SalesOfficeOptionsController {
  constructor(private readonly service: SalesOfficeOptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new sales office option' })
  create(@Body() createDto: CreateSalesOfficeOptionDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales office options' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sales office option by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a sales office option' })
  update(@Param('id') id: string, @Body() updateDto: UpdateSalesOfficeOptionDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a sales office option' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
