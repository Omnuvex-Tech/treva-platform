import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateObjectTypeDto {
  @ApiPropertyOptional({ example: 'Resident Complex' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Resident Complex' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'resident-complex' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  order?: number;
}
