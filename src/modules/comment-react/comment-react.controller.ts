import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentReactService } from './comment-react.service';
import { CreateCommentReactDto } from './dto/create-comment-react.dto';

@Controller('comment-react')
@ApiTags('COMMENT-REACT')
export class CommentReactController {
  constructor(private readonly commentReactService: CommentReactService) {}

  @Post()
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiOperation({summary: 'User React Comment By Id'})
  react(@Req() req: any, @Body() createCommentReactDto: CreateCommentReactDto) {
    return this.commentReactService.react(req, createCommentReactDto);
  }
}
