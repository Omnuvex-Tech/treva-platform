import { PartialType } from '@nestjs/swagger';
import { CreateConstructionStageOptionDto } from './create-construction-stage-option.dto';

export class UpdateConstructionStageOptionDto extends PartialType(CreateConstructionStageOptionDto) {}
