import { Controller, Get, Post, Body, Req, UseGuards, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth')
@ApiTags('AUTH')
export class AuthController {
  constructor(private readonly authService: AuthService) {
    // seed default admin
    this.authService.seedDefaultAdmin('admin', 'admin@gmail.com', 'myhufierVSL@03112000_ADMIN');
    this.authService.seedDefaultMod('mod', 'mod@gmail.com', 'myhufierVSL@03112000_MOD');
    this.authService.seedDefaultMem('mem', 'mem@gmail.com', 'myhufierVSL@03112000_MEM');
  }

  @Post()
  @ApiOperation({ summary: 'Login to authen' })
  async login(@Req() req: any, @Body() dto: LoginDto) {
    return await this.authService.login(req, dto);
  }

  @Get()
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  async me(@Req() req: any) {
    return this.authService.me(req);
  }

  @Post('/refresh')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh Token For User' })
  async refresh(@Req() req: any) {
    return await this.authService.refresh(req);
  }

  @Get('/facebook')
  @ApiOperation({ summary: 'Login Auth Facebook Dialog' })
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Post('/facebook')
  @ApiOperation({ summary: 'Create new account or token for user loged' })
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginOrCreate(@Req() req: Request): Promise<any> {
    return await this.authService.facebookLoginOrCreate(req.user);
  }

  @Get('/google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login Auth Google Dialog' })
  async googleLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Post('/google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Create new account or token for user loged' })
  async googleLoginOrCreate(@Req() req: Request) {
    return this.authService.googleLoginOrCreate(req.user)
  }
}
