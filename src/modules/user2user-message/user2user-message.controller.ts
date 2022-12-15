import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User2userMessageService } from './user2user-message.service';

@Controller('user2user-message')
@ApiTags('USER2USER-MESS')
export class User2userMessageController {
  constructor(private readonly user2userMessageService: User2userMessageService) { }

  @Get(':room')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Get histories chat by room' })
  @ApiBearerAuth()
  getChatByRoom(@Req() req: any, @Param('room') room: string) {
    return this.user2userMessageService.getChatByRoom(req, room);
  }

  @Post('/userChatHistories')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Get histories chat of user' })
  @ApiBearerAuth()
  async getUserChatHistories(@Req() req: any) {
    return await this.user2userMessageService.getUserChatHistories(req);
  }
}
