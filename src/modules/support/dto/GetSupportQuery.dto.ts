import { ApiPropertyOptional } from "@nestjs/swagger";

export class GetSupportDto {
  @ApiPropertyOptional({ default: 1 })
  page: number;

  @ApiPropertyOptional({ default: 10 })
  limit: 10;
}