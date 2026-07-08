import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateObjectTypeDto {
  @ApiProperty({ example: 'Resident Complex' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Resident Complex' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'resident-complex' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  order?: number;
}
