import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateRealExamOwnDto {
  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  postId: number;

  @ApiProperty({default:false})
  ttexam: boolean;
}
