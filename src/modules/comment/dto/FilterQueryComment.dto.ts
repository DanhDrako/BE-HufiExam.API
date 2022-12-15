import { ApiPropertyOptional } from "@nestjs/swagger";

export class FilterCommentQuery {
  @ApiPropertyOptional()
  userId: string;

  @ApiPropertyOptional({ default: 1 })
  page: number;

  @ApiPropertyOptional({ default: 10 })
  limit: number;
}