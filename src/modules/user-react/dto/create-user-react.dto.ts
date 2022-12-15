import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { REACT_TYPE } from "src/common/Enums";

export class CreateUserReactDto {
  @ApiProperty()
  @IsNotEmpty()
  postId: number;

  @ApiProperty({ default: REACT_TYPE.USER_LIKE })
  @IsNotEmpty()
  reactType: REACT_TYPE;
}
