import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApartmentTypeDto {
  @ApiProperty({ example: 'studio' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Modern Renovation' })
  @IsString()
  @IsNotEmpty()
  title: string;
}
