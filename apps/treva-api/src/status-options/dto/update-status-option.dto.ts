import { PartialType } from '@nestjs/swagger';
import { CreateStatusOptionDto } from './create-status-option.dto';

export class UpdateStatusOptionDto extends PartialType(CreateStatusOptionDto) {}
