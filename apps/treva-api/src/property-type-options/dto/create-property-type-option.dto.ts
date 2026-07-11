import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePropertyTypeOptionDto {
  @IsString()
  @IsNotEmpty()
  value: string;
}
