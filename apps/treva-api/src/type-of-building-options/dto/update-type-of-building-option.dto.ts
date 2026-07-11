import { PartialType } from '@nestjs/swagger';
import { CreateTypeOfBuildingOptionDto } from './create-type-of-building-option.dto';

export class UpdateTypeOfBuildingOptionDto extends PartialType(CreateTypeOfBuildingOptionDto) {}
