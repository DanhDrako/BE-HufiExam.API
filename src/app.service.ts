import { HttpStatus, Injectable } from '@nestjs/common';
import { TaskRes } from './common/Classess';

@Injectable()
export class AppService {
  getHello(): TaskRes {
    const task = new TaskRes();
    task.success = true;
    task.statusCode = HttpStatus.OK;
    task.message = HttpStatus[HttpStatus.OK];
    task.bonus = 'Wellcome to the SERVICE: MY-HUFIER';

    return task;
  }
}
