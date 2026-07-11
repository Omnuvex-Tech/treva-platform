import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTypeOfBuildingOptionDto {
  @IsString()
  @IsNotEmpty()
  value: string;
}
