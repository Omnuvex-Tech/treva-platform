import { PartialType } from '@nestjs/swagger';
import { CreateRoomOptionDto } from './create-room-option.dto';

export class UpdateRoomOptionDto extends PartialType(CreateRoomOptionDto) {}
