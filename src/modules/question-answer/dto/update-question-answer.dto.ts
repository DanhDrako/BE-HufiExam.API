import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateQuestionAnswerDto {
  @ApiProperty()
  @IsNotEmpty()
  body: any[];
}
