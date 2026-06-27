import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePulseCategoryDto {
  @ApiProperty({ example: 'Bloq' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
