import { ApiPropertyOptional } from "@nestjs/swagger";

export class FilterQuestion {
  @ApiPropertyOptional({ default: 1 })
  page: number;

  @ApiPropertyOptional({ default: 10 })
  limit: number;

  @ApiPropertyOptional({ default: false })
  isRandom: boolean;

  @ApiPropertyOptional({ default: false })
  isQa: boolean;

  @ApiPropertyOptional({ default: 0 })
  skip: number;
}