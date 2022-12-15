import { ApiPropertyOptional } from "@nestjs/swagger";

export class FilterQueryString {
  @ApiPropertyOptional({ default: '' })
  readonly keyWord: string;

  // 0 -> get all
  @ApiPropertyOptional({ default: 0 })
  readonly cate: number;

  @ApiPropertyOptional()
  readonly tags: number[];

  @ApiPropertyOptional({ default: 1 })
  readonly page: number;

  @ApiPropertyOptional({ default: 10 })
  readonly limit: number;

  @ApiPropertyOptional()
  readonly userId: string;

  @ApiPropertyOptional({ default: false })
  isBlackMarket: boolean;

  @ApiPropertyOptional({ default: false })
  unCommited: boolean;

  @ApiPropertyOptional({ default: 0 })
  sort: number;

  @ApiPropertyOptional({ default: false })
  start: boolean;

  @ApiPropertyOptional({ default: false })
  heart: boolean;
}