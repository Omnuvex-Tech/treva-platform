import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({ example: 'Farid Aliyev' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '+994501234567' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]+$/, { message: 'Phone number must contain only digits and optional leading +' })
  phoneNumber: string;
}
