import { IsOptional, IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ApartmentPriceInput } from './create-apartment.dto';

export class UpdateApartmentDto {
  @ApiPropertyOptional({ example: '2-Room Flat' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: '2-room-flat-60m' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: '<p>Beautiful apartment...</p>' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '/uploads/images/apartment.jpg' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: [] })
  @IsOptional()
  @IsArray()
  gallery?: any[];

  @ApiPropertyOptional({ example: 175000 })
  @IsOptional()
  @IsNumber()
  priceTotal?: number;

  @ApiPropertyOptional({ example: 2917 })
  @IsOptional()
  @IsNumber()
  priceByArea?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  roomCount?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  area?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  floorFrom?: number;

  @ApiPropertyOptional({ example: 16 })
  @IsOptional()
  @IsNumber()
  floorTo?: number;

  @ApiPropertyOptional({ example: 'Baku city' })
  @IsOptional()
  @IsString()
  locationTitle?: string;

  @ApiPropertyOptional({ example: 'https://maps.google.com/...' })
  @IsOptional()
  @IsString()
  locationUrl?: string;

  @ApiPropertyOptional({ example: 'Renovated' })
  @IsOptional()
  @IsString()
  renovation?: string;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsNumber()
  kitchenSize?: number;

  @ApiPropertyOptional({ example: 'Brick' })
  @IsOptional()
  @IsString()
  wallMaterial?: string;

  @ApiPropertyOptional({ example: 'apartment-type-id' })
  @IsOptional()
  @IsString()
  apartmentTypeId?: string;

  @ApiPropertyOptional({ example: 'owner-id' })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({ example: [] })
  @IsOptional()
  @IsArray()
  attributeIds?: string[];

  @ApiPropertyOptional({ example: [] })
  @IsOptional()
  @IsArray()
  requestIds?: string[];

  @ApiPropertyOptional({ example: 'active', enum: ['active', 'pending', 'non-active'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ type: [ApartmentPriceInput] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApartmentPriceInput)
  prices?: ApartmentPriceInput[];
}
