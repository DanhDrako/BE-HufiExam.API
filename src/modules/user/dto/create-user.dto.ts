import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
