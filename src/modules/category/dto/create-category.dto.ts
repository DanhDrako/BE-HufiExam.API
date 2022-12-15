import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { IMAGE_UPLOAD_TYPE } from "src/common/Enums";

export class CreateCategoryDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  imageBanner: string;

  @ApiProperty({default: IMAGE_UPLOAD_TYPE.SERVER})
  imageUploadType: IMAGE_UPLOAD_TYPE;

  @ApiProperty({ default: false })
  isBlackMarket: boolean;
}
