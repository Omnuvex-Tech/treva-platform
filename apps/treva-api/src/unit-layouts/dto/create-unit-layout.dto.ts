import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  ValidateNested,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class NumberOfFloorsDto {
  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(1)
  @Max(999)
  start: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(1)
  @Max(999)
  end: number;
}

export class MainImageDto {
  @ApiProperty({ example: '/uploads/images/main.png' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ example: '1 Bedroom Junior blueprint' })
  @IsOptional()
  @IsString()
  alt?: string;
}

export class GalleryImageDto {
  @ApiProperty({ example: '/uploads/images/gallery1.png' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ example: 'Gallery image 1' })
  @IsOptional()
  @IsString()
  alt?: string;
}

export class DocumentDto {
  @ApiProperty({ example: 'pdf' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: '/uploads/documents/plan.pdf' })
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateUnitLayoutDto {
  @ApiProperty({ example: '1 Bedroom Junior' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '1br-junior' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '1br-junior-apt' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'Sea Breeze Residence' })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Premium off-plan unit layout with sea-facing facade.' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ example: 'sea breeze, penthouse, off-plan' })
  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @ApiPropertyOptional({ example: 'https://example.com/projects/sea-breeze-residence' })
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @ApiPropertyOptional({ example: '/uploads/images/seo-cover.png' })
  @IsOptional()
  @IsString()
  seoImage?: string;

  @ApiPropertyOptional({ example: 'available', enum: ['available', 'reserved', 'sold'] })
  @IsOptional()
  @IsEnum(['available', 'reserved', 'sold'])
  status?: 'available' | 'reserved' | 'sold';

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  archived?: boolean;

  @ApiProperty({ example: 'clx1234567890' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ example: 'clx1234567890' })
  @IsOptional()
  @IsString()
  houseId?: string;

  @ApiPropertyOptional({ example: 'cuid...' })
  @IsOptional()
  @IsString()
  roomOptionId?: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  @Max(999)
  floor: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  @Max(999)
  number: number;

  @ApiProperty({ example: 50.5 })
  @IsNumber()
  @Min(0)
  totalArea: number;

  @ApiProperty({ example: 43.0 })
  @IsNumber()
  @Min(0)
  internalArea: number;

  @ApiProperty({ example: 7.5 })
  @IsNumber()
  @Min(0)
  balconyArea: number;

  @ApiProperty({ example: { USD: 150000, AZN: 255000 } })
  @IsObject()
  prices: Record<string, number>;

  @ApiProperty({ example: 2030 })
  @IsNumber()
  @Max(2100)
  completionYear: number;

  @ApiProperty({ example: { start: 3, end: 30 } })
  @IsObject()
  @ValidateNested()
  @Type(() => NumberOfFloorsDto)
  numberOfFloors: NumberOfFloorsDto;

  @ApiProperty({ example: ['id1', 'id2'] })
  @IsArray()
  @IsString({ each: true })
  similarApartmentIds: string[];

  @ApiPropertyOptional({ type: MainImageDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MainImageDto)
  mainImage?: MainImageDto;

  @ApiPropertyOptional({ type: MainImageDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MainImageDto)
  coverImage?: MainImageDto;

  @ApiProperty({ type: [GalleryImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GalleryImageDto)
  gallery: GalleryImageDto[];

  @ApiProperty({ type: [DocumentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents: DocumentDto[];

  @ApiPropertyOptional({ example: 'Residential' })
  @IsOptional()
  @IsString()
  typeOfBuilding?: string;

  @ApiPropertyOptional({ example: 'Under construction' })
  @IsOptional()
  @IsString()
  constructionStage?: string;

  @ApiPropertyOptional({ example: '<p>Beautiful apartment</p>' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ['id1', 'id2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  heatingTypeIds?: string[];

  @ApiPropertyOptional({ example: ['id1', 'id2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attributeIds?: string[];
}
