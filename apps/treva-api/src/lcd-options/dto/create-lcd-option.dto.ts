import { IsString, IsNotEmpty } from 'class-validator';

export class CreateLcdOptionDto {
  @IsString()
  @IsNotEmpty()
  value: string;
}
