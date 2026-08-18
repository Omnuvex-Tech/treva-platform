import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class SectionPermissionDto {
  @ApiProperty({ example: 'offplan' })
  @IsString()
  @IsNotEmpty()
  section: string;

  @ApiProperty({ example: ['objects', 'unitLayouts'], type: [String] })
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  menuKeys: string[];
}

export class CreateUserDto {
  @ApiProperty({ example: 'sales@treva.realestate' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongpassword' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: 'Sales Manager' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [SectionPermissionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionPermissionDto)
  permissions?: SectionPermissionDto[];
}
