import { Controller, Post, Body, UseGuards, Req, Get, Param, Delete, Put, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FilterCommentQuery } from './dto/FilterQueryComment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comment')
@ApiTags('COMMENT')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }

  @Post()
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Push a comment' })
  async create(@Req() req: any, @Body() createCommentDto: CreateCommentDto) {
    return await this.commentService.create(req, createCommentDto);
  }

  @Get(':postId')
  @ApiOperation({ summary: 'Get list comment' })
  async gets(@Req() req: any, @Param('postId') postId: number, @Query() param: FilterCommentQuery) {
    return await this.commentService.gets(req, postId, param);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit comment by id' })
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  async edit(@Req() req: any, @Param('id') id: number, @Body()dto: UpdateCommentDto) {
    return await this.commentService.edit(req, id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete comment by id' })
  @UseGuards(AuthGuard())
  async delete(@Req() req: any, @Param('id') id: number) {
    return await this.commentService.delete(req, id);
  }
}
