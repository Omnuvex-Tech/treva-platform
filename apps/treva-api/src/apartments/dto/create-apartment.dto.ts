import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
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

  @ApiPropertyOptional({ example: '/uploads/images/apartment.jpg' })
  @IsOptional()
  @IsString()
  image?: string;

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

  @ApiProperty({ example: 8 })
  @IsNumber()
  @IsNotEmpty()
  floorFrom: number;

  @ApiProperty({ example: 16 })
  @IsNumber()
  @IsNotEmpty()
  floorTo: number;

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

  @ApiPropertyOptional({ type: [ApartmentPriceInput] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApartmentPriceInput)
  prices?: ApartmentPriceInput[];
}
