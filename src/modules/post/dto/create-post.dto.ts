import { ApiProperty } from "@nestjs/swagger";
import { IMAGE_UPLOAD_TYPE } from "src/common/Enums";

export class CreatePostDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

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

  @ApiProperty()
  linksDownload: string;

  @ApiProperty()
  isBlackMarket: boolean;

  @ApiProperty({ default: 0 })
  priceBuy: number;

  @ApiProperty({ default: 0 })
  priceSell: number;
}
