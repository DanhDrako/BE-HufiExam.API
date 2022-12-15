import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Put } from '@nestjs/common';
import { RealExamOwnService } from './real-exam-own.service';
import { CreateRealExamOwnDto } from './dto/create-real-exam-own.dto';
import { UpdateRealExamOwnDto } from './dto/update-real-exam-own.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGaurd } from '../auth/Guards/roles.gaurd';
import { RolerUser } from 'src/common/Enums';

@Controller('real-exam-own')
@ApiTags('REAL EXAM OWN')
export class RealExamOwnController {
  constructor(private readonly realExamOwnService: RealExamOwnService) {}

  @Post()
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @ApiOperation({ summary: 'Push a email to real exam' })
  @ApiBearerAuth()
  create(@Req() req: any, @Body() createRealExamOwnDto: CreateRealExamOwnDto) {
    return this.realExamOwnService.create(req, createRealExamOwnDto);
  }

  @Get('/checkexamreal/:id')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Check Email to PostId' })
  @ApiBearerAuth()
  CheckUserExam(@Req() req: any,@Param('id') id: string) {
    return this.realExamOwnService.CheckUserExam(req, +id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get all email in PostId' })
  findOne(@Param('id') id: string) {
    return this.realExamOwnService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRealExamOwnDto: UpdateRealExamOwnDto) {
    return this.realExamOwnService.update(+id, updateRealExamOwnDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a email to real exam' })
  remove(@Param('id') id: string) {
    return this.realExamOwnService.remove(+id);
  }
}
