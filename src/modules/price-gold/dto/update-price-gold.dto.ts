import { PartialType } from '@nestjs/swagger';
import { CreatePriceGoldDto } from './create-price-gold.dto';

export class UpdatePriceGoldDto extends PartialType(CreatePriceGoldDto) {}
