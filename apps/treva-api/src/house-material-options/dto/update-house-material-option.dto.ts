import { PartialType } from '@nestjs/swagger';
import { CreateHouseMaterialOptionDto } from './create-house-material-option.dto';

export class UpdateHouseMaterialOptionDto extends PartialType(CreateHouseMaterialOptionDto) {}
