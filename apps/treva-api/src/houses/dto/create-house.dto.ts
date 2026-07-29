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

export class HouseLocationDto {
  @ApiProperty({ example: 'Sea Breeze Resort' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'https://seabreeze.az' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'house' })
  @IsString()
  @IsNotEmpty()
  type: string;
}

export class HouseNumberOfFloorsDto {
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

export class HouseMainImageDto {
  @ApiProperty({ example: '/uploads/images/main.png' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ example: 'House main image' })
  @IsOptional()
  @IsString()
  alt?: string;
}

export class HouseGalleryImageDto {
  @ApiProperty({ example: '/uploads/images/gallery1.png' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ example: 'Gallery image 1' })
  @IsOptional()
  @IsString()
  alt?: string;
}

export class HouseDocumentDto {
  @ApiProperty({ example: 'pdf' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: '/uploads/documents/plan.pdf' })
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateHouseDto {
  @ApiProperty({ example: 'Block A' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'block-a' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'sea-breeze-block-a' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'Sea Breeze Block A' })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Sea Breeze Block A details.' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ example: 'sea breeze, block a' })
  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @ApiPropertyOptional({ example: 'https://example.com/projects/sea-breeze-block-a' })
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

  @ApiPropertyOptional({ example: 'cuid...' })
  @IsOptional()
  @IsString()
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
  @Type(() => HouseNumberOfFloorsDto)
  numberOfFloors: HouseNumberOfFloorsDto;

  @ApiProperty({ example: ['id1', 'id2'] })
  @IsArray()
  @IsString({ each: true })
  similarApartmentIds: string[];

  @ApiPropertyOptional({ type: HouseMainImageDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HouseMainImageDto)
  mainImage?: HouseMainImageDto;

  @ApiPropertyOptional({ type: HouseMainImageDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HouseMainImageDto)
  coverImage?: HouseMainImageDto;

  @ApiProperty({ type: [HouseGalleryImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HouseGalleryImageDto)
  gallery: HouseGalleryImageDto[];

  @ApiProperty({ type: [HouseDocumentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HouseDocumentDto)
  documents: HouseDocumentDto[];

  @ApiPropertyOptional({ type: HouseLocationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HouseLocationDto)
  location?: HouseLocationDto;

  @ApiPropertyOptional({ example: 'Residential' })
  @IsOptional()
  @IsString()
  typeOfBuilding?: string;

  @ApiPropertyOptional({ example: 'Under construction' })
  @IsOptional()
  @IsString()
  constructionStage?: string;

  @ApiPropertyOptional({ example: '<p>House description</p>' })
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

  @ApiPropertyOptional({ example: 'https://www.google.com/maps/embed?pb=...' })
  @IsOptional()
  @IsString()
  locationGoogleMapsUrl?: string;

  @ApiPropertyOptional({ example: 'Main street' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ example: '12A' })
  @IsOptional()
  @IsString()
  houseNumber?: string;

  @ApiPropertyOptional({ example: '2028-12-01' })
  @IsOptional()
  @IsString()
  deadlineForCommissioning?: string;

  @ApiPropertyOptional({ example: 'Sales office A' })
  @IsOptional()
  @IsString()
  salesOffice?: string;

  @ApiPropertyOptional({ example: 'AA-12345' })
  @IsOptional()
  @IsString()
  landCadastralNumber?: string;

  @ApiPropertyOptional({ example: 'Address according to contract' })
  @IsOptional()
  @IsString()
  contractAddress?: string;

  @ApiPropertyOptional({ example: 'Second address according to contract' })
  @IsOptional()
  @IsString()
  secondContractAddress?: string;

  @ApiPropertyOptional({ example: 'Available' })
  @IsOptional()
  @IsString()
  showroomAvailability?: string;

  @ApiPropertyOptional({ example: 'Available in second language' })
  @IsOptional()
  @IsString()
  secondShowroomAvailability?: string;
}
