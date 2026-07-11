import { PartialType } from '@nestjs/swagger';
import { CreateHeatingTypeOptionDto } from './create-heating-type-option.dto';

export class UpdateHeatingTypeOptionDto extends PartialType(CreateHeatingTypeOptionDto) {}
