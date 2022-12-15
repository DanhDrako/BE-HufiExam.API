import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AuthClient {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  request_name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  request_time: number;
}