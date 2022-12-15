import { Controller, Get, Post, Body, UseGuards, Delete, Param, Put, Query, Req } from '@nestjs/common';
import { TagNameService } from './tag-name.service';
import { CreateTagNameDto } from './dto/create-tag-name.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGaurd } from '../auth/Guards/roles.gaurd';
import { RolerUser } from 'src/common/Enums';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateTagNameDto } from './dto/update-tag-name.dto';
import { QueryGetTagsDto } from './dto/query-get-tags.dto';

@Controller('tag-name')
@ApiTags('TAG-NAME')
export class TagNameController {
  constructor(private readonly tagNameService: TagNameService) {}

  @Post()
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({summary: 'Create a tag-name role [ADMIN]'})
  async create(@Req() req: any, @Body() createTagNameDto: CreateTagNameDto) {
    return await this.tagNameService.create(req, createTagNameDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({summary: 'Get a tag-name by id role [ADMIN]'})
  async get(@Req() req: any, @Param('id') id: number) {
    return await this.tagNameService.get(req, id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({summary: 'Delete a tag-name role [ADMIN]'})
  async delete(@Req() req: any, @Param('id') id: number) {
    return await this.tagNameService.delete(req, id);
  }

  @Put(':id')
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({summary: 'Edit a tag-name role [ADMIN]'})
  async edit(@Req() req: any, @Param('id') id: number, @Body() dto: UpdateTagNameDto) {
    return await this.tagNameService.edit(req, id, dto);
  }

  @Get()
  @ApiOperation({summary: 'Get all tag-name'})
  findAll(@Req() req: any, @Query() query: QueryGetTagsDto) {
    return this.tagNameService.findAll(req, query);
  }
}
