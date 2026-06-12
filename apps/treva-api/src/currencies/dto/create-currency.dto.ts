import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateCurrencyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
