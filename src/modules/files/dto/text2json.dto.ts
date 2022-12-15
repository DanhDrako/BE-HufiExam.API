import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class TextToJsonDto {
  @ApiProperty({ default: 'cau' })
  @IsNotEmpty()
  qFind: string;

  @ApiProperty({ default: ['a.', 'b.', 'c.', 'd.'] })
  @IsNotEmpty()
  aFinds: string[];
}