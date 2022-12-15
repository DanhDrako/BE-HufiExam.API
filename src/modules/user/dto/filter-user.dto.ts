import { ApiPropertyOptional } from "@nestjs/swagger";

export class FilterUserDto {
  @ApiPropertyOptional()
  keyWord: string;

  @ApiPropertyOptional({ default: 1 })
  page: number;

  @ApiPropertyOptional({ default: 10 })
  limit: number;
}