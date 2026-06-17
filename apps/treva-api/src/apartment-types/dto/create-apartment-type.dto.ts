import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApartmentTypeDto {
  @ApiProperty({ example: 'Modern Renovation' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'modern-renovation' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  order?: number;
}
