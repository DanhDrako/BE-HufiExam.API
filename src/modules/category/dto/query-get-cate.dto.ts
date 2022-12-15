import { ApiPropertyOptional } from "@nestjs/swagger";

export class QueryGetCateDto {
  @ApiPropertyOptional({ default: false })
  isBlackMarket: boolean;

  @ApiPropertyOptional({ default: 1 })
  page: number;

  @ApiPropertyOptional({ default: 100 })
  limit: number;
}