import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { trimString } from '../../auth/dto/normalize';

/**
 * The shapes below are treva-broker's `DocumentInput` / `DocumentListQuery`
 * (apps/treva-broker/src/features/brokers/types.ts). Change both together.
 */
export const DOCUMENT_CATEGORIES = [
  'brochure',
  'price_list',
  'floor_plan',
  'presentation',
  'policy',
  'other',
] as const;
export type DocumentCategoryValue = (typeof DOCUMENT_CATEGORIES)[number];

export const DOCUMENT_LANGUAGES = ['az', 'en', 'ru'] as const;
export type DocumentLanguageValue = (typeof DOCUMENT_LANGUAGES)[number];

/**
 * The Visibility card's four switches (873:52110) — independent booleans, not
 * one audience picked from a list.
 */
export class DocumentFlagsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowDownload?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyBrokers?: boolean;
}

/**
 * Multipart, so every field arrives as a string: the file carries the size, the
 * type and the bytes, and the only thing the modal (873:49824) collects beside
 * it is a name. Everything else the edit screen fills in afterwards.
 */
export class CreateDocumentDto {
  @ApiPropertyOptional({
    description: 'Falls back to the uploaded file’s own name when empty',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  name?: string;
}

/** The editable half of a file — what the edit screen's form owns. */
export class UpdateDocumentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ enum: DOCUMENT_CATEGORIES })
  @IsOptional()
  @IsIn(DOCUMENT_CATEGORIES)
  category?: DocumentCategoryValue;

  @ApiPropertyOptional({ enum: DOCUMENT_LANGUAGES })
  @IsOptional()
  @IsIn(DOCUMENT_LANGUAGES)
  language?: DocumentLanguageValue;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ type: DocumentFlagsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DocumentFlagsDto)
  flags?: DocumentFlagsDto;
}

export class DocumentListQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  search?: string;
}
