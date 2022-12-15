import { Module } from '@nestjs/common';
import { PriceGoldService } from './price-gold.service';
import { PriceGoldController } from './price-gold.controller';


@Module({
  controllers: [PriceGoldController],
  providers: [PriceGoldService],
})
export class PriceGoldModule {}
