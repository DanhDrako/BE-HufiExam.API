import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { TaskRes } from './common/Classess';

@Controller()
@ApiTags('ROOT')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): TaskRes {
    return this.appService.getHello();
  }
}
