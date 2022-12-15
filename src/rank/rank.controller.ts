import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Session,
} from '@nestjs/common';
import { RankService } from './rank.service';
import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RankFilter } from './dto/rankFilter.dto';
import { AuthService } from 'src/modules/auth/auth.service';

@Controller('rank')
@ApiTags('RANK')
export class RankController {
  constructor(
    private readonly rankService: RankService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  create(@Req() req: any, @Body() createRankDto: CreateRankDto) {
    return this.rankService.create(req, createRankDto);
  }

  @Get()
  async findAll(@Query() filter: RankFilter) {
    let decodeToken = null;
    if (filter.request_token) {
      const token = filter.request_token;
      decodeToken = await this.authService.validate_And_Decode_TokenUser(
        token,
      );
      if (!decodeToken.success) return decodeToken;
      decodeToken = decodeToken.result;
    }
    return this.rankService.findAll(decodeToken, filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rankService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRankDto: UpdateRankDto) {
    return this.rankService.update(+id, updateRankDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rankService.remove(+id);
  }
}
