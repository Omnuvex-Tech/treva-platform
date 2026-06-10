import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Panorama by ELIE SAAB' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'panorama-by-elie-saab' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'panorama-by-elie-saab' })
  @IsString()
  @IsNotEmpty()
  slug: string;
}
