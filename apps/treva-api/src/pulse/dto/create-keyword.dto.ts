import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKeywordDto {
  @ApiProperty({ example: 'daşınmaz əmlak' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'dasinmaz-emlak' })
  @IsString()
  @IsNotEmpty()
  slug: string;
}
