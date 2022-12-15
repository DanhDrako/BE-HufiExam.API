import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateRealTestDto {
  @ApiProperty({ default: true })
  @IsNotEmpty()
  isRealTest: boolean;

  @ApiProperty({ default: 0 })
  @IsNotEmpty()
  realTestTime: number;

  @ApiProperty({ default: false })
  @IsNotEmpty()
  realTestRandom: boolean;
}