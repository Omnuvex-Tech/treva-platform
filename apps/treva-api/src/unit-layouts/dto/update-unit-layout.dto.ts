import { PartialType } from '@nestjs/swagger';
import { CreateUnitLayoutDto } from './create-unit-layout.dto';

export class UpdateUnitLayoutDto extends PartialType(CreateUnitLayoutDto) {}
