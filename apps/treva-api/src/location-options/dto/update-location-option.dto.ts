import { PartialType } from '@nestjs/swagger';
import { CreateLocationOptionDto } from './create-location-option.dto';

export class UpdateLocationOptionDto extends PartialType(CreateLocationOptionDto) {}
