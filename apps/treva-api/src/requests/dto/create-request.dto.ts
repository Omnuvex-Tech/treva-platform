import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({ example: 'Farid Aliyev' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '+994501234567' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
