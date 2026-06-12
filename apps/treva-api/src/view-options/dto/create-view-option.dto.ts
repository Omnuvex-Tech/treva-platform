import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateViewOptionDto {
  @ApiProperty({ example: 'Sea view' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  order?: number;
}
