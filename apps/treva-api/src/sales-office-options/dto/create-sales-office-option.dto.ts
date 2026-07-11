import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSalesOfficeOptionDto {
  @IsString()
  @IsNotEmpty()
  value: string;
}
