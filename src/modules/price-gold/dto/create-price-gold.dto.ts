import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePriceGoldDto {
  @ApiProperty()
  @IsNotEmpty()
  typeGold: string;

  @ApiProperty()
  province: string;

  @ApiProperty()
  @IsNotEmpty()
  buy: number;

  @ApiProperty()
  @IsNotEmpty()
  sell: number;
}
