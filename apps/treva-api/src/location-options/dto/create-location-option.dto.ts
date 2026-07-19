import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLocationOptionDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['region', 'city'])
  type: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  cityId?: string;
}
