import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateConstructionStageOptionDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
