import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { trimString } from '../../auth/dto/normalize';

/**
 * The shapes below are treva-broker's `ProjectInput` / `ProjectListQuery`
 * (apps/treva-broker/src/features/projects/types.ts). Change both together.
 */
export const PROJECT_STATUSES = ['active', 'inactive'] as const;
export type ProjectStatusValue = (typeof PROJECT_STATUSES)[number];

export const HIGHLIGHT_KINDS = [
  'handover',
  'payment',
  'view',
  'amenities',
  'transit',
  'mortgage',
] as const;

export const OFFER_TAGS = ['new', 'limited', 'exclusive'] as const;

/**
 * A stored image is a path this app serves (`/uploads/...`, or a bundled
 * `/projects/...`) or an absolute http(s) URL. Never a `data:` URL: the editor
 * uploads a picked file first, and inlining the bytes into the row is exactly
 * what that upload exists to prevent.
 */
const IMAGE_URL = /^(\/(?!\/)|https?:\/\/)/;

export class ProjectHighlightDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(64)
  id: string;

  @ApiPropertyOptional({ enum: HIGHLIGHT_KINDS })
  @IsIn(HIGHLIGHT_KINDS)
  kind: (typeof HIGHLIGHT_KINDS)[number];

  /** An uploaded icon drawn instead of the kind's glyph; null for the glyph. */
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(500)
  @Matches(IMAGE_URL, { message: 'iconUrl must be a stored image URL' })
  iconUrl?: string | null;

  @ApiPropertyOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  label: string;

  @ApiPropertyOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  value: string;

  @ApiPropertyOptional()
  @IsBoolean()
  enabled: boolean;
}

export class ProjectOfferDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(64)
  id: string;

  @ApiPropertyOptional({ enum: OFFER_TAGS })
  @IsIn(OFFER_TAGS)
  tag: (typeof OFFER_TAGS)[number];

  @ApiPropertyOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiPropertyOptional({ description: 'ISO date, or empty while unset' })
  @IsString()
  @ValidateIf((_, value) => value !== '')
  @IsISO8601()
  expiresAt: string;

  @ApiPropertyOptional()
  @IsBoolean()
  enabled: boolean;
}

export class ProjectMaterialDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(64)
  id: string;

  @ApiPropertyOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(32)
  category: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(8)
  language: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sizeBytes: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  downloads: number;

  /** Where POST /projects/materials stored the file. */
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @Matches(IMAGE_URL, { message: 'url must be a stored file URL' })
  url: string;
}

export class ProjectAvailabilityDto {
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100_000)
  available: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100_000)
  reserved: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100_000)
  sold: number;

  @ApiPropertyOptional()
  @IsBoolean()
  autoCalculate: boolean;

  /** Sent back as loaded; the server stamps its own. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastSyncedAt?: string;
}

/**
 * Everything is optional, create included: the editor (873:51091) saves a
 * partial draft, and `name` — the one field a project cannot be without — is
 * checked by the service so the message reads like the rest of the app's.
 */
export class SaveProjectDto {
  @ApiPropertyOptional({ example: 'Pearl Towers' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    example: 'https://www.treva.realestate/project/pearl',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(500)
  publicUrl?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(500)
  @Matches(IMAGE_URL, { message: 'heroImageUrl must be a stored image URL' })
  heroImageUrl?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  @Matches(IMAGE_URL, {
    each: true,
    message: 'galleryImageUrls must be stored image URLs',
  })
  galleryImageUrls?: string[];

  @ApiPropertyOptional({ type: [ProjectHighlightDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ProjectHighlightDto)
  highlights?: ProjectHighlightDto[];

  @ApiPropertyOptional({ type: [ProjectOfferDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ProjectOfferDto)
  offers?: ProjectOfferDto[];

  @ApiPropertyOptional({ type: [ProjectMaterialDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ProjectMaterialDto)
  materials?: ProjectMaterialDto[];

  @ApiPropertyOptional({ type: ProjectAvailabilityDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ProjectAvailabilityDto)
  availability?: ProjectAvailabilityDto;

  // The card and the list's search read these. Of them the editor draws only
  // Location, beside the project name; the rest arrive from the inventory sync
  // rather than from treva-broker.

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  developer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ enum: PROJECT_STATUSES })
  @IsOptional()
  @IsIn(PROJECT_STATUSES)
  status?: ProjectStatusValue;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceFrom?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(20)
  bedroomsFrom?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(20)
  bedroomsTo?: number;

  @ApiPropertyOptional({ description: 'ISO date, or empty to clear' })
  @IsOptional()
  @IsString()
  @ValidateIf((_, value) => value !== '')
  @IsISO8601()
  deliveryDate?: string;
}

export class ProjectListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  perPage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: PROJECT_STATUSES })
  @IsOptional()
  @IsIn(PROJECT_STATUSES)
  status?: ProjectStatusValue;
}
