import { PartialType } from '@nestjs/swagger';
import { CreateSalesOfficeOptionDto } from './create-sales-office-option.dto';

export class UpdateSalesOfficeOptionDto extends PartialType(CreateSalesOfficeOptionDto) {}
