import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateRoomOptionDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
