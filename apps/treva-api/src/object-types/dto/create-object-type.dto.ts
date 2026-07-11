import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
