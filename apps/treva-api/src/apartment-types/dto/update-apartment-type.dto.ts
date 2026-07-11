import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateApartmentTypeDto {
  @ApiPropertyOptional({ example: 'studio' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Modern Renovation' })
  @IsOptional()
  @IsString()
  title?: string;
}
