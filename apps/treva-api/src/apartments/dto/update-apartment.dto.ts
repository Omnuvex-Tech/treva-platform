import { IsOptional, IsString, IsNumber, IsArray, ValidateNested, IsIn, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ApartmentPriceInput, MAX_RESALE_FLOOR } from './create-apartment.dto';

export class UpdateApartmentDto {
  @ApiPropertyOptional({ example: 'Sea Breeze' })
  @IsOptional()
  @IsString()
  name?: string;

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

  @ApiPropertyOptional({ example: 'Sea Breeze Residence | For Sale in Baku' })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Spacious apartment listing with rich details and pricing.' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ example: 'baku apartment, sea breeze, for sale' })
  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @ApiPropertyOptional({ example: 'https://treva.az/resale/sea-breeze-residence' })
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @ApiPropertyOptional({ example: '/uploads/images/apartment-seo.jpg' })
  @IsOptional()
  @IsString()
  seoImage?: string;

  @ApiPropertyOptional({ example: '/uploads/images/apartment.jpg' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: '/uploads/images/apartment-cover.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;

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

  @ApiPropertyOptional({ example: 67 })
  @IsOptional()
  @IsNumber()
  grossArea?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(MAX_RESALE_FLOOR)
  floorFrom?: number;

  @ApiPropertyOptional({ example: 16 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(MAX_RESALE_FLOOR)
  floorTo?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  bathroomCount?: number;

  @ApiPropertyOptional({ example: 'sale', enum: ['sale', 'rent'] })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiPropertyOptional({ example: 'Baku' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: 'Nasimi' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Baku city' })
  @IsOptional()
  @IsString()
  locationTitle?: string;

  @ApiPropertyOptional({ example: 'https://maps.google.com/...' })
  @IsOptional()
  @IsString()
  locationUrl?: string;

  @ApiPropertyOptional({ example: 'https://www.google.com/maps/embed?pb=...' })
  @IsOptional()
  @IsString()
  locationGoogleMapsUrl?: string;

  @ApiPropertyOptional({ example: 'renovated', enum: ['renovated', 'non-renovated'] })
  @IsOptional()
  @IsString()
  @IsIn(['renovated', 'non-renovated'])
  renovation?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  mortgage?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  extract?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  parking?: boolean;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  buildingAge?: number;

  @ApiPropertyOptional({ example: 2028 })
  @IsOptional()
  @IsNumber()
  completionYear?: number;

  @ApiPropertyOptional({ example: 'furnished', enum: ['furnished', 'unfurnished'] })
  @IsOptional()
  @IsString()
  @IsIn(['furnished', 'unfurnished'])
  furnishing?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  elevator?: boolean;

  @ApiPropertyOptional({ example: 2.8 })
  @IsOptional()
  @IsNumber()
  ceilingHeight?: number;

  @ApiPropertyOptional({ example: ['heating-type-id'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  heatingTypeIds?: string[];

  @ApiPropertyOptional({ example: ['view-option-id'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  viewOptionIds?: string[];

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

  @ApiPropertyOptional({ example: 'active', enum: ['active', 'reserved', 'sold'] })
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
