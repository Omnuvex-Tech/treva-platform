import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ example: 'menzil-almaq-ucun-ilkin-odenis' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Mənzil almaq üçün ilkin ödəniş nə qədər olmalıdır?' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Bloq' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ example: '2026-05-08' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cover.webp' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ example: 'Mənzil almaq haqqında məqalə' })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional({ example: 'clxxx1234 author-id' })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({ type: [String], example: ['clxxx123', 'clxxx456'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywordIds?: string[];

  @ApiPropertyOptional({ description: 'Content blocks as JSON array' })
  @IsOptional()
  blocks?: any[];

  @ApiPropertyOptional({ example: 'Mənzil almaq üçün ilkin ödəniş' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'İlkin ödəniş haqqında ətraflı məlumat' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ enum: ['left', 'center', 'right', 'week'], example: 'left' })
  @IsOptional()
  @IsString()
  @IsIn(['left', 'center', 'right', 'week'])
  headerPosition?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  headerOrder?: number;
}
