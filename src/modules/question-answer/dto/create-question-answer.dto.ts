import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateQuestionAnswerDto {
  @ApiProperty()
  @IsNotEmpty()
  postId: number;

  @ApiProperty()
  @IsNotEmpty()
  q: string;

  @ApiProperty()
  @IsNotEmpty()
  a: string;

  @ApiProperty()
  @IsNotEmpty()
  qa: number;
}
