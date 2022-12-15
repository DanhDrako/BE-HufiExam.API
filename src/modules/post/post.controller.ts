import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FilterQueryString as PostFilter } from "./dto/FilterQueryString";
import { RolesGaurd } from '../auth/Guards/roles.gaurd';
import { RolerUser } from 'src/common/Enums';
import { UpdateRealTestDto } from './dto/update-real-test.dto';

@Controller('post')
@ApiTags('POST')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Post()
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Push a post into DB' })
  @ApiBearerAuth()
  create(@Req() req: any, @Body() createPostDto: CreatePostDto) {
    return this.postService.create(req, createPostDto);
  }

  @Post('/commit/:id')
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @ApiOperation({ summary: 'Commit a post by id role [ ADMIN ]' })
  @ApiBearerAuth()
  async commit(@Req() req: any, @Param('id') id: number) {
    return await this.postService.commit(req, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by id' })
  async findOne(@Req() req: any, @Param('id') id: number) {
    return await this.postService.findOne(req, id);
  }

  @Get('filter/v1')
  @ApiOperation({ summary: 'Filter post v1.0' })
  async filter(@Req() req: any, @Query() query: PostFilter) {
    return await this.postService.filterV2(req, query);
  }

  @Get('manage/v1')
  @ApiOperation({ summary: 'manage post v1.0' })
  @UseGuards(AuthGuard())
  async managePost(@Req() req: any, @Query() query: PostFilter) {
    return await this.postService.managePost(req, query);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Update post by id' })
  @ApiBearerAuth()
  update(@Req() req: any, @Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(req, +id, updatePostDto);
  }

  @Put('/showRank/:id')
  @UseGuards(AuthGuard())
  @ApiOperation({summary: 'Update post is show rank'})
  @ApiBearerAuth()
  updateShowRank(@Req() req: any,@Param('id') id: string, @Body() updatePostDto: UpdatePostDto){
    return this.postService.updateShowRank(req, +id, updatePostDto);
  }

  @Put('/realTest/:id')
  @UseGuards(AuthGuard())
  @ApiOperation({summary: 'Update post is show rank'})
  @ApiBearerAuth()
  updateRealTest(@Req() req: any,@Param('id') id: string, @Body() dto: UpdateRealTestDto){
    return this.postService.updateRealTest(req, +id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Delete post by id' })
  @ApiBearerAuth()
  remove(@Req() req: any, @Param('id') id: string) {
    return this.postService.remove(req, +id);
  }

  @Get('/get/is-vsl-one')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'get is vsl one -> true / false ?' })
  @ApiBearerAuth()
  isVslOne(@Req() req: any,) {
    return this.postService.isVslOne(req);
  }

  @Post('/post/is-vsl-one')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'set VslOne into DB' })
  @ApiBearerAuth()
  setVslOne(@Req() req: any,) {
    return this.postService.setVslOne(req);
  }
}
