import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsIn,
  IsInt,
  IsNotEmpty,
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
 * The shapes below are treva-broker's `NewsInput` / `NewsListQuery`
 * (apps/treva-broker/src/features/news/types.ts). Change both together.
 */
export const NEWS_CATEGORIES = ['news', 'announcement'] as const;
export const NEWS_STATUSES = ['draft', 'scheduled', 'published'] as const;
export const NEWS_LANGUAGES = ['az', 'en', 'ru', ''] as const;
export const ATTACHMENT_KINDS = [
  'pdf',
  'doc',
  'sheet',
  'image',
  'other',
] as const;

/** Only files this API stored — never an arbitrary remote address. */
const UPLOADED_URL = /^\/uploads\/[\w./-]+$/;

/** The editor sends "" for an unset date; that is "not set", not invalid. */
const toDateOrNull = ({ value }: { value: unknown }) =>
  value === '' || value === null
    ? null
    : typeof value === 'string'
      ? new Date(value)
      : value;

export class NewsAttachmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  sizeBytes: number;

  @ApiProperty({ enum: ATTACHMENT_KINDS })
  @IsIn(ATTACHMENT_KINDS)
  kind: (typeof ATTACHMENT_KINDS)[number];

  @ApiProperty({ example: '/uploads/documents/1726400000000-abc.pdf' })
  @Matches(UPLOADED_URL, { message: 'url must be a file from /uploads' })
  url: string;
}

export class NewsVisibilityDto {
  @ApiProperty()
  @IsBoolean()
  featured: boolean;

  @ApiProperty()
  @IsBoolean()
  showOnDashboard: boolean;

  @ApiProperty()
  @IsBoolean()
  pushNotification: boolean;

  @ApiProperty()
  @IsBoolean()
  emailNotification: boolean;
}

export class CreateNewsDto {
  @ApiProperty({ example: 'Q3 commission structure' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'What changes for brokers from July.' })
  @Transform(trimString)
  @IsString()
  excerpt: string;

  @ApiProperty({ description: 'HTML from the News Content editor' })
  @IsString()
  @MaxLength(500_000)
  body: string;

  @ApiProperty({ enum: NEWS_CATEGORIES })
  @IsIn(NEWS_CATEGORIES)
  category: (typeof NEWS_CATEGORIES)[number];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @Matches(UPLOADED_URL, {
    message: 'coverImageUrl must be a file from /uploads',
  })
  coverImageUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @ApiPropertyOptional({ enum: NEWS_STATUSES })
  @IsOptional()
  @IsIn(NEWS_STATUSES)
  status?: (typeof NEWS_STATUSES)[number];

  @ApiPropertyOptional({ type: [NewsAttachmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewsAttachmentDto)
  attachments?: NewsAttachmentDto[];

  @ApiPropertyOptional({ type: NewsVisibilityDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NewsVisibilityDto)
  visibility?: NewsVisibilityDto;

  @ApiPropertyOptional({ enum: NEWS_LANGUAGES })
  @IsOptional()
  @IsIn(NEWS_LANGUAGES)
  language?: (typeof NEWS_LANGUAGES)[number];

  @ApiPropertyOptional({ example: '2026-09-20T09:00:00.000Z' })
  @IsOptional()
  @Transform(toDateOrNull)
  @ValidateIf((_, value) => value !== null)
  @IsDate()
  publishAt?: Date | null;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @Transform(toDateOrNull)
  @ValidateIf((_, value) => value !== null)
  @IsDate()
  expiresAt?: Date | null;
}

export class UpdateNewsDto extends PartialType(CreateNewsDto) {}

export class NewsListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  perPage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: NEWS_CATEGORIES })
  @IsOptional()
  @IsIn(NEWS_CATEGORIES)
  category?: (typeof NEWS_CATEGORIES)[number];
}
