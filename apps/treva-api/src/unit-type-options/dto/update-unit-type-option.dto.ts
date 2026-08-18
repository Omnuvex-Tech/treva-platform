import { PartialType } from '@nestjs/swagger';
import { CreateUnitTypeOptionDto } from './create-unit-type-option.dto';

export class UpdateUnitTypeOptionDto extends PartialType(
  CreateUnitTypeOptionDto,
) {}
