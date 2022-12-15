import { FilterQueryPriceGold } from './dto/FilterQueryPriceGold';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PriceGoldService } from './price-gold.service';
import { CreatePriceGoldDto } from './dto/create-price-gold.dto';
import { UpdatePriceGoldDto } from './dto/update-price-gold.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('price-gold')
@ApiTags('PRICE GOLD')
export class PriceGoldController {
  constructor(private readonly priceGoldService: PriceGoldService) {}

  @Post()
  @ApiOperation({summary: "Create new data price gold"})
  create() {
    return this.priceGoldService.create();
  }

  @Get()
  @ApiOperation({summary: "get list province price gold"})
  findAll(@Query() query: FilterQueryPriceGold) {
    return this.priceGoldService.findAll(query);
  }
}
