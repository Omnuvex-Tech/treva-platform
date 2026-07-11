import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class ApartmentPriceInput {
  @ApiProperty({ example: 'currency-id' })
  @IsString()
  @IsNotEmpty()
  currencyId: string;

  @ApiPropertyOptional({ example: 175000 })
  @Transform(({ value }) => (value === null || value === undefined || value === '' ? undefined : Number(value)))
  @IsNumber()
  @IsOptional()
  priceTotal?: number;

  @ApiPropertyOptional({ example: 2917 })
  @Transform(({ value }) => (value === null || value === undefined || value === '' ? undefined : Number(value)))
  @IsNumber()
  @IsOptional()
  priceByArea?: number;
}

export class CreateApartmentDto {
  @ApiPropertyOptional({ example: 'Sea Breeze' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '2-Room Flat' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '2-room-flat-60m' })
  @IsString()
  @IsNotEmpty()
  slug: string;

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
  @IsNumber()
  @IsOptional()
  priceTotal?: number;

  @ApiPropertyOptional({ example: 2917 })
  @IsNumber()
  @IsOptional()
  priceByArea?: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsNotEmpty()
  roomCount: number;

  @ApiProperty({ example: 60 })
  @IsNumber()
  @IsNotEmpty()
  area: number;

  @ApiPropertyOptional({ example: 54 })
  @IsOptional()
  @IsNumber()
  netArea?: number;

  @ApiPropertyOptional({ example: 67 })
  @IsOptional()
  @IsNumber()
  grossArea?: number;

  @ApiPropertyOptional({ example: 32 })
  @IsOptional()
  @IsNumber()
  livingArea?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsNumber()
  kitchenArea?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  balconyArea?: number;

  @ApiProperty({ example: 8 })
  @IsNumber()
  @IsNotEmpty()
  floorFrom: number;

  @ApiProperty({ example: 16 })
  @IsNumber()
  @IsNotEmpty()
  floorTo: number;

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

  @ApiPropertyOptional({ example: 'renovated', enum: ['renovated', 'non-renovated'] })
  @IsOptional()
  @IsString()
  @IsIn(['renovated', 'non-renovated'])
  renovation?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  parking?: boolean;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  buildingAge?: number;

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

  @ApiProperty({ example: 'apartment-type-id' })
  @IsString()
  @IsNotEmpty()
  apartmentTypeId: string;

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
