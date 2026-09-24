import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * The Layouts tab's sort control (873:50496) — treva-broker's `LayoutSort`
 * (apps/treva-broker/src/features/floor-plan/types.ts). Change both together.
 */
export const LAYOUT_SORTS = [
  'lowestPrice',
  'highestPrice',
  'largestArea',
] as const;
export type LayoutSortValue = (typeof LAYOUT_SORTS)[number];

export class LayoutListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  perPage?: number;

  @ApiPropertyOptional({ enum: LAYOUT_SORTS, default: 'lowestPrice' })
  @IsOptional()
  @IsIn(LAYOUT_SORTS)
  sort?: LayoutSortValue;
}
