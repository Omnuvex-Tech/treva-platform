import { PartialType } from '@nestjs/swagger';
import { CreatePropertyTypeOptionDto } from './create-property-type-option.dto';

export class UpdatePropertyTypeOptionDto extends PartialType(CreatePropertyTypeOptionDto) {}
