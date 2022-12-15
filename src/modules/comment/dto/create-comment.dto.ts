import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  postId: number;

  @ApiProperty()
  @IsNotEmpty()
  content: string;
}
