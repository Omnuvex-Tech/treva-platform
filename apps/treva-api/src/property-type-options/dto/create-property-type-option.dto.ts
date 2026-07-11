import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreatePropertyTypeOptionDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
