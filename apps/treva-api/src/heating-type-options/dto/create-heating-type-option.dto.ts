import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHeatingTypeOptionDto {
  @ApiProperty({ example: 'central-heating' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Central Heating' })
  @IsString()
  @IsNotEmpty()
  title: string;
}
