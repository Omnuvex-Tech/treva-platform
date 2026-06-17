import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRequestDto {
  @ApiPropertyOptional({ example: 'Farid Aliyev' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '+994501234567' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
