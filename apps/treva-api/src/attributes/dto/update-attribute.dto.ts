import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAttributeDto {
  @ApiPropertyOptional({ example: 'renovation' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Renovation' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Modern' })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({ example: '🏠' })
  @IsOptional()
  @IsString()
  icon?: string;
}
