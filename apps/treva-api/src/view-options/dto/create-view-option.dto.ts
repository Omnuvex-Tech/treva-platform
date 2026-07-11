import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateViewOptionDto {
  @ApiProperty({ example: 'sea-view' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Sea View' })
  @IsString()
  @IsNotEmpty()
  title: string;
}
