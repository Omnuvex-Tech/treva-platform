import { PartialType } from '@nestjs/swagger';
import { CreateLcdOptionDto } from './create-lcd-option.dto';

export class UpdateLcdOptionDto extends PartialType(CreateLcdOptionDto) {}
