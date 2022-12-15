import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RankFilter {
  @ApiProperty({default: 1})
  page: number;

  @ApiProperty({default: 10})
  limit: number;

  @ApiProperty({default: 1})
  pageUsers: number;

  @ApiProperty({default: 20})
  limitUsers: number;

  @ApiPropertyOptional()
  request_token: string;
}