import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUnitTypeOptionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  title: string;
}
