import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateStatusOptionDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
