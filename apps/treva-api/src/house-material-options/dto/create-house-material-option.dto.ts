import { IsString, IsNotEmpty } from 'class-validator';

export class CreateHouseMaterialOptionDto {
  @IsString()
  @IsNotEmpty()
  value: string;
}
