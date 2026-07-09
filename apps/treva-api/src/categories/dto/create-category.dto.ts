import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  housesCount?: number;

  @ApiPropertyOptional({ example: '/uploads/images/example.webp' })
  @IsOptional()
  @IsString()
  image?: string;

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
}
