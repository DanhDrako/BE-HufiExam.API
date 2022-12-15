import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UserReactService } from './user-react.service';
import { CreateUserReactDto } from './dto/create-user-react.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('user-react')
@ApiTags('USER-REACT')
export class UserReactController {
  constructor(private readonly userReactService: UserReactService) {}

  @Post()
  @ApiOperation({summary: 'User React Post'})
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  async react(@Req() req: any, @Body() dto: CreateUserReactDto) {
    return await this.userReactService.create(req, dto);
  }
}
