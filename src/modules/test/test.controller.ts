import { Controller, Param, Post, Req, UseGuards, } from '@nestjs/common';
import { TestService } from './test.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGaurd } from '../auth/Guards/roles.gaurd';
import { RolerUser } from 'src/common/Enums';

@Controller('test')
@ApiTags('TEST')
export class TestController {
  constructor(private readonly testService: TestService) { }

  @Post('send-mail/:to')
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @ApiOperation({ summary: 'Test send mail role [ADMIN]' })
  @ApiBearerAuth()
  async sendMail(@Req() req: any, @Param('to') to: string) {
    return await this.testService.sendMail(req, to);
  }
}
