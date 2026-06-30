import { IsString, IsNotEmpty, IsInt, IsOptional, IsIn } from 'class-validator';

export class CreateRoomOptionDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsOptional()
  @IsIn(['resale', 'off-plan'])
  type?: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
