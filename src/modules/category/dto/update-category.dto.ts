import { ApiProperty } from "@nestjs/swagger";
import { IMAGE_UPLOAD_TYPE } from "src/common/Enums";

export class UpdateCategoryDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  imageBanner: string;

  @ApiProperty({default: IMAGE_UPLOAD_TYPE.SERVER})
  imageUploadType: IMAGE_UPLOAD_TYPE;
}
