import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateSupportDto } from './dto/create-support.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetSupportDto } from './dto/GetSupportQuery.dto';

@Controller('support')
@ApiTags('SUPPORT')
export class SupportController {
  constructor(private readonly supportService: SupportService) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Push a suggestion by user' })
  @UseGuards(AuthGuard())
  async create(@Req() req: any, @Body() createSupportDto: CreateSupportDto) {
    return await this.supportService.create(req, createSupportDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get suggestions by user' })
  async gets(@Req() req: any, @Query() query: GetSupportDto) {
    return await this.supportService.gets(req, query);
  }
}
