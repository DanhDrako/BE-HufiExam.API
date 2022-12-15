import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { COMMENT_REACT_TYPE } from "src/common/Enums";

export class CreateCommentReactDto {
  @ApiProperty()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  status: COMMENT_REACT_TYPE;
}
