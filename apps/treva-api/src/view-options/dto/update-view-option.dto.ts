import { PartialType } from '@nestjs/swagger';
import { CreateViewOptionDto } from './create-view-option.dto';

export class UpdateViewOptionDto extends PartialType(CreateViewOptionDto) {}
