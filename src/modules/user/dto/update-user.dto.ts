import { ApiProperty } from "@nestjs/swagger";
import { SEX_USER } from "src/common/Enums";

export class UpdateUserDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  birthDay: Date;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  sex: SEX_USER;

  @ApiProperty()
  linkFacebook: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  oldPasswrod: string;

  @ApiProperty()
  avatar: string;
}
