import { PartialType } from '@nestjs/swagger';
import { CreatePulseCategoryDto } from './create-pulse-category.dto';

export class UpdatePulseCategoryDto extends PartialType(CreatePulseCategoryDto) {}
