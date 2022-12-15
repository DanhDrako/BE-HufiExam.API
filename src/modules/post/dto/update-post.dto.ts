import { ApiProperty } from "@nestjs/swagger";
import { IMAGE_UPLOAD_TYPE } from "src/common/Enums";

export class UpdatePostDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  imageBanner: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ default: 1 })
  category: number;

  @ApiProperty({ default: IMAGE_UPLOAD_TYPE.SERVER })
  imageUploadType: IMAGE_UPLOAD_TYPE;

  @ApiProperty()
  tags: string[];

  @ApiProperty()
  images: string;

  @ApiProperty({ default: true })
  isShowRank: boolean;

  @ApiProperty({ default: false })
  isRealTest: boolean;

  @ApiProperty({ default: 0 })
  realTestTime: number;

  @ApiProperty({ default: false })
  realTestRandom: boolean;
}
