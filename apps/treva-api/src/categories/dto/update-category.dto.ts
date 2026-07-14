import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CategoryDocumentDto } from './create-category.dto';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Panorama by ELIE SAAB' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'panorama-by-elie-saab' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'panorama-by-elie-saab' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'active', enum: ['active', 'archive'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '/uploads/images/example.webp' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: '/uploads/images/cover-example.webp' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  housesCount?: number;

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

  @ApiPropertyOptional({ example: 'Resident Complex' })
  @IsOptional()
  @IsString()
  objectType?: string;

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

  @ApiPropertyOptional({ example: 'ELIE SAAB' })
  @IsOptional()
  @IsString()
  developerBrand?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: 'Sberbank' })
  @IsOptional()
  @IsString()
  banks?: string;

  @ApiPropertyOptional({ example: 'Pool, Gym' })
  @IsOptional()
  @IsString()
  infrastructure?: string;

  @ApiPropertyOptional({ example: '+7 999 123 4567' })
  @IsOptional()
  @IsString()
  salesDepartment?: string;

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
