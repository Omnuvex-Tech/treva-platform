import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttributeDto {
  @ApiProperty({ example: 'renovation' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Renovation' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Modern' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiPropertyOptional({ example: '🏠' })
  @IsOptional()
  @IsString()
  icon?: string;
}
