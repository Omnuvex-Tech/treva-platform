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

export class LocationDto {
  @ApiProperty({ example: 'Sea Breeze Resort' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'https://seabreeze.az' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'apartment' })
  @IsString()
  @IsNotEmpty()
  type: string;
}

export class NumberOfFloorsDto {
  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(1)
  start: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(1)
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

  @ApiPropertyOptional({ enum: ['available', 'sold', 'reserved'], default: 'available' })
  @IsEnum(['available', 'sold', 'reserved'])
  status?: string;

  @ApiProperty({ example: 'clx1234567890' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ example: 'cuid...' })
  @IsOptional()
  @IsString()
  roomOptionId?: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  floor: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  number: number;

  @ApiProperty({ example: 50.5, maximum: 10000 })
  @IsNumber()
  @Min(0)
  @Max(10000)
  totalArea: number;

  @ApiProperty({ example: 43.0, maximum: 10000 })
  @IsNumber()
  @Min(0)
  @Max(10000)
  internalArea: number;

  @ApiProperty({ example: 7.5, maximum: 10000 })
  @IsNumber()
  @Min(0)
  @Max(10000)
  balconyArea: number;

  @ApiProperty({ example: 186004 })
  @IsNumber()
  @Min(0)
  priceUsd: number;

  @ApiProperty({ example: 317000 })
  @IsNumber()
  @Min(0)
  priceAzn: number;

  @ApiProperty({ example: 2030 })
  @IsNumber()
  completionYear: number;

  @ApiProperty({ example: { start: 3, end: 30 } })
  @IsObject()
  @ValidateNested()
  @Type(() => NumberOfFloorsDto)
  numberOfFloors: NumberOfFloorsDto;

  @ApiProperty({ example: 'clq1234567890abcdefg', required: false })
  @IsString()
  @IsOptional()
  viewOptionId?: string;

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

  @ApiProperty({ type: LocationDto })
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;
}
