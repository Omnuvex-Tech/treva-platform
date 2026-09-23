import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { trimString } from '../../auth/dto/normalize';

/**
 * The shapes below are treva-broker's `ClientInput` / `ClientListQuery`
 * (apps/treva-broker/src/features/clients/types.ts). Change both together.
 */
export const CLIENT_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ClientStatusValue = (typeof CLIENT_STATUSES)[number];

/** Blank extra numbers are the rows a user added and left empty; drop them. */
const trimEach = ({ value }: { value: unknown }): unknown =>
  Array.isArray(value)
    ? (value as unknown[])
        .map((entry) => (typeof entry === 'string' ? entry.trim() : entry))
        .filter((entry) => entry !== '')
    : value;

const lowerTrim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class CreateClientDto {
  @ApiProperty({ example: 'Emin' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Aliyev' })
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: '+994 50 311 44 21' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  phone: string;

  @ApiProperty({ type: [String], example: ['+994 12 505 18 90'] })
  @Transform(trimEach)
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  additionalPhones: string[];

  @ApiProperty({ example: 'emin.aliyev@gmail.com' })
  @Transform(lowerTrim)
  @IsString()
  @ValidateIf((_, value) => value !== '')
  @IsEmail()
  @MaxLength(254)
  email: string;

  /**
   * Sent by the form but decided by the server: a lead belongs to whoever
   * registers it, and only a role that may assign clients can point it at
   * another broker.
   */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brokerId?: string;

  @ApiProperty({ example: 'Pearl Towers' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  objectOfInterest: string;

  @ApiProperty({ example: 'Pearl Group' })
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  developerBrand: string;

  @ApiProperty({ example: 'pearlgroup.az' })
  @Transform(trimString)
  @IsString()
  @MaxLength(300)
  website: string;

  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(5000)
  comments: string;

  @ApiProperty({ description: 'The client acknowledged the privacy policy' })
  @IsBoolean()
  consent: boolean;

  /** Only admins review leads; anyone else sending it is refused. */
  @ApiPropertyOptional({ enum: CLIENT_STATUSES })
  @IsOptional()
  @IsIn(CLIENT_STATUSES)
  status?: ClientStatusValue;
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}

export class BulkDeleteClientsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  ids: string[];
}

export class ClientListQueryDto {
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

  @ApiPropertyOptional({ enum: CLIENT_STATUSES })
  @IsOptional()
  @IsIn(CLIENT_STATUSES)
  status?: ClientStatusValue;

  /** Narrows the list to one broker, within what the caller may see. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brokerId?: string;
}
