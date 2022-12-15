import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateTagNameDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
}
