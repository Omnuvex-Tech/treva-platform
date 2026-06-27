import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuthorDto {
  @ApiProperty({ example: 'Emil Qurbanov' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'emil-qurbanov' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'Satış üzrə Menecer' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.webp' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: 'TREVA real estate komandasının üzvü' })
  @IsOptional()
  @IsString()
  description?: string;
}
