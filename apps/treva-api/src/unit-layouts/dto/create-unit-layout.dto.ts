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

  @ApiPropertyOptional({ example: 'clq1234567890' })
  @IsOptional()
  @IsString()
  statusOptionId?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  archived?: boolean;

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

  @ApiPropertyOptional({ type: LocationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiPropertyOptional({ example: 'LCD-1' })
  @IsOptional()
  @IsString()
  lcd?: string;

  @ApiPropertyOptional({ example: 'Residential' })
  @IsOptional()
  @IsString()
  typeOfBuilding?: string;

  @ApiPropertyOptional({ example: 'Apartment' })
  @IsOptional()
  @IsString()
  defaultPropertyType?: string;

  @ApiPropertyOptional({ example: 'Under construction' })
  @IsOptional()
  @IsString()
  constructionStage?: string;

  @ApiPropertyOptional({ example: { month: 1, year: 2024 } })
  @IsOptional()
  @IsObject()
  startOfConstruction?: Record<string, number>;

  @ApiPropertyOptional({ example: { month: 12, year: 2026 } })
  @IsOptional()
  @IsObject()
  completionOfConstruction?: Record<string, number>;

  @ApiPropertyOptional({ example: { month: 3, year: 2024 } })
  @IsOptional()
  @IsObject()
  startOfSales?: Record<string, number>;

  @ApiPropertyOptional({ example: { month: 6, year: 2027 } })
  @IsOptional()
  @IsObject()
  endOfSales?: Record<string, number>;

  @ApiPropertyOptional({ example: 'Main Office' })
  @IsOptional()
  @IsString()
  salesOffice?: string;

  @ApiPropertyOptional({ example: '123 Main Street, Building 5' })
  @IsOptional()
  @IsString()
  contractAddress?: string;

  @ApiPropertyOptional({ example: 'Neftchilar Avenue' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ example: '42' })
  @IsOptional()
  @IsString()
  houseNumber?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsString()
  deadlineForCommissioning?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  landCadastralNumber?: string;

  @ApiPropertyOptional({ example: 'Yes' })
  @IsOptional()
  @IsString()
  showroomAvailability?: string;

  @ApiPropertyOptional({ example: 'Renovated' })
  @IsOptional()
  @IsString()
  renovation?: string;

  @ApiPropertyOptional({ example: 'Brick' })
  @IsOptional()
  @IsString()
  wallMaterial?: string;

  @ApiPropertyOptional({ example: '<p>Beautiful apartment</p>' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'clx1234567890' })
  @IsOptional()
  @IsString()
  ownerId?: string;

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

  @ApiPropertyOptional({ example: 'Seafront Boulevard' })
  @IsOptional()
  @IsString()
  locationTitle?: string;

  @ApiPropertyOptional({ example: 'https://maps.example.com/...' })
  @IsOptional()
  @IsString()
  locationUrl?: string;
}
