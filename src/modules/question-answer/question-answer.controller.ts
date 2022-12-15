import { Controller, Body, Get, UseGuards, Param, Query, Put, Req, Post, Delete } from '@nestjs/common';
import { QuestionAnswerService } from './question-answer.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FilterQuestion } from './dto/filter-question.dto';
import { UpdateQuestionAnswerDto } from './dto/update-question-answer.dto';
import { RolesGaurd } from '../auth/Guards/roles.gaurd';
import { RolerUser } from 'src/common/Enums';
import { CreateQuestionAnswerDto } from './dto/create-question-answer.dto';
import { FilterQueryBasicDto } from './dto/FilterQueryBasicDto';

@Controller('question-answer')
@ApiTags('QUESTION-ANSWER')
export class QuestionAnswerController {
  constructor(private readonly questionAnswerService: QuestionAnswerService) { }

  @Get(':postId')
  // @UseGuards(AuthGuard())
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Question by post id' })
  async gets(@Req() req: any, @Param('postId') postId: number, @Query() filter: FilterQuestion) {
    return await this.questionAnswerService.gets(req, postId, filter);
  }

  @Put(':postId')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'puts Question by post id' })
  async puts(@Req() req: any, @Param('postId') postId: number, @Body() dto: UpdateQuestionAnswerDto) {
    return await this.questionAnswerService.puts(req, postId, dto);
  }

  @Post()
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Insert a question answer' })
  async insertQa(@Body() dto: CreateQuestionAnswerDto) {
    return await this.questionAnswerService.insertQa(dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a question answer' })
  async DeleteQa(@Param('id') id: number) {
    return await this.questionAnswerService.DeleteQa(id);
  }

  @Get()
  @ApiOperation({ summary: 'List exam availble' })
  async getExamTest(@Query() query: FilterQueryBasicDto) {
    return await this.questionAnswerService.getExamTest(query);
  }
}
