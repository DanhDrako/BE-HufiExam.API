import { Controller, Get, Post, Body, Put, Param, UseGuards, Req, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGaurd } from '../auth/Guards/roles.gaurd';
import { RolerUser } from 'src/common/Enums';
import { FilterUserDto } from "./dto/filter-user.dto";

@Controller('user')
@ApiTags('USER')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @ApiOperation({ summary: 'User register role default [ MEM ]' })
  create(@Req() req: any, @Body() createUserDto: CreateUserDto) {
    return this.userService.create(req, createUserDto);
  }

  @Post('/active/:token')
  @ApiOperation({ summary: 'Active Account' })
  async active(@Req() req: any, @Param('token') token: string) {
    return await this.userService.active(req, token);
  }

  @Put()
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Account For User' })
  async update(@Req() req: any, @Body() dto: UpdateUserDto) {
    return await this.userService.update(req, dto);
  }

  @Post('reset-password/:email')
  @ApiOperation({ summary: 'Reset Password For User' })
  async resetPassword(@Req() req: any, @Param('email') email: string) {
    return await this.userService.resetPassword(req, email);
  }

  @Put('reset-password/:newpass')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update new password for user [token send from mail]' })
  async resetPasswordByToken(@Req() req: any, @Param('newpass') newPass: string) {
    return await this.userService.resetPasswordByToken(req, newPass);
  }

  @Get()
  @ApiOperation({ summary: 'Get list user role [ ADMIN ] ' })
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @ApiBearerAuth()
  async gets(@Req() req: any) {
    return await this.userService.gets(req);
  }

  @Get('filter')
  @ApiOperation({ summary: 'filter list user ' })
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  async filter(@Req() req: any, @Query() filter: FilterUserDto) {
    return await this.userService.filter(req, filter);
  }
}
