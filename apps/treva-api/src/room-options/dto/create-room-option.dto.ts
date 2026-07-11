import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateRoomOptionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  @IsIn(['resale', 'off-plan'])
  type?: string;
}
