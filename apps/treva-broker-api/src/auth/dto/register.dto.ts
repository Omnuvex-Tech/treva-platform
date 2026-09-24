import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { normalizeEmail, trimString } from './normalize';

export const ACCOUNT_TYPES = ['individual', 'company'] as const;
export type AccountTypeValue = (typeof ACCOUNT_TYPES)[number];

export class RegisterDto {
  @ApiProperty({ example: 'leyla.hasanova@example.com' })
  @Transform(normalizeEmail)
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email: string;

  // bcrypt only reads the first 72 bytes, so anything longer would silently
  // accept a different password than the one typed.
  @ApiProperty({ example: 'password123', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @ApiProperty({ enum: ACCOUNT_TYPES, example: 'individual' })
  @IsIn(ACCOUNT_TYPES)
  type: AccountTypeValue;

  /** The only company detail sign-up asks for. Required when `type` is "company". */
  @ApiPropertyOptional({ example: 'Omnuvex MMC', maxLength: 120 })
  @Transform(trimString)
  @ValidateIf((dto: RegisterDto) => dto.type === 'company')
  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  @MaxLength(120)
  companyName?: string;

  @ApiPropertyOptional({ example: 'Leyla Hasanova', maxLength: 120 })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;
}
