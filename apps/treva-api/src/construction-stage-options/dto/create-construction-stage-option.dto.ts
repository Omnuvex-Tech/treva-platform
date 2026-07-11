import { IsString, IsNotEmpty } from 'class-validator';

export class CreateConstructionStageOptionDto {
  @IsString()
  @IsNotEmpty()
  value: string;
}
