import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CategoryDocumentDto {
  @ApiProperty({ example: 'pdf' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: '/uploads/documents/plan.pdf' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ example: 'Master Plan A' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class CreateCategoryDto {
  @ApiProperty({ example: 'Panorama by ELIE SAAB' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'panorama-by-elie-saab' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'panorama-by-elie-saab' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'Residential' })
  @IsOptional()
  @IsString()
  objectType?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  housesCount?: number;

  @ApiPropertyOptional({ example: '/uploads/images/example.webp' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: '/uploads/images/cover-example.webp' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ example: '/uploads/images/banner-example.webp' })
  @IsOptional()
  @IsString()
  bannerImage?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  propertiesCount?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  reservedCount?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  soldCount?: number;

  @ApiPropertyOptional({ example: 'Panorama' })
  @IsOptional()
  @IsString()
  propertyName?: string;

  @ApiPropertyOptional({ example: 'Rubels' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Baku' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: '12000' })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiPropertyOptional({ example: 'Baku' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Baku city, Murtuza Mukhtarov str, house 31' })
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

  @ApiPropertyOptional({ example: 'ELIE SAAB' })
  @IsOptional()
  @IsString()
  developerBrand?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: '+7 999 123 4567' })
  @IsOptional()
  @IsString()
  salesDepartment?: string;

  @ApiPropertyOptional({ example: '+994 50 123 45 67' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  fedLaw214?: boolean;

  @ApiPropertyOptional({ example: 'object', enum: ['category', 'object'] })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ type: [CategoryDocumentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDocumentDto)
  documents?: CategoryDocumentDto[];
}
