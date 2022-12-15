import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateRankDto {
  @ApiProperty()
  @IsNotEmpty()
  // @IsNumber()
  postId: number;

  @ApiProperty()
  @IsNotEmpty()
  // @IsNumber()
  point: number;

  @ApiProperty()
  request_name: string;
  @ApiProperty()
  request_time_from: number;
  @ApiProperty()
  request_time_to: number;
}
