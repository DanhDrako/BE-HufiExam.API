import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateTagNameDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ default: false })
  isBlackMarket: boolean;
}
