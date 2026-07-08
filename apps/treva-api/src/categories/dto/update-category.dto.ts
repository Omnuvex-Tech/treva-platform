import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Panorama by ELIE SAAB' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'panorama-by-elie-saab' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'panorama-by-elie-saab' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'active', enum: ['active', 'archive'] })
  @IsOptional()
  @IsString()
  status?: string;
}
