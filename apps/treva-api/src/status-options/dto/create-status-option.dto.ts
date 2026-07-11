import { IsString, IsNotEmpty } from 'class-validator';

export class CreateStatusOptionDto {
  @IsString()
  @IsNotEmpty()
  value: string;
}
