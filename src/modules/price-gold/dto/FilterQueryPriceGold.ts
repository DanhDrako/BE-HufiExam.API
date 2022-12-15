import { ApiPropertyOptional } from "@nestjs/swagger";

export class FilterQueryPriceGold {
  @ApiPropertyOptional({ default: 1 })
  readonly day: number;
  @ApiPropertyOptional({ default: "" })
  readonly province: string;
}