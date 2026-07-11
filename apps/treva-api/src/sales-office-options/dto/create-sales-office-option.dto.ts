import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateSalesOfficeOptionDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
