import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { TaskRes } from 'src/common/Classess';
import { PublicModules } from 'src/common/PublicModules';
import { MailBasicDto } from './dto/mail-basic.dto';
import { Connection, Repository } from 'typeorm';
import { Counts } from 'src/entities/counts.entity';
import { COUNT_TYPE } from 'src/common/Enums';

@Injectable()
export class MailService {
  private countRepo: Repository<Counts> = null;
  public MAX_OF_DATE = 100;

  constructor(
    private readonly mailerService: MailerService,
    private readonly connection: Connection,
  ) {
    this.countRepo = this.connection.getRepository(Counts);
  }

  async getCountOfDay() {
    let find = await this.countRepo.findOne({ where: { type: COUNT_TYPE.SEND_MAIL } });
    if (!find) {
      find = this.countRepo.create();
      find.type = COUNT_TYPE.SEND_MAIL;
      find.count = 0;
      find.total = 0;
      find.date = new Date(new Date().toDateString());
      await this.countRepo.save(find);
    }
    return find;
  }

  async increeCount(instance: Counts) {
    const dateOld = new Date(instance.date.toDateString());
    const dateNew = new Date(new Date().toDateString());
    if (dateNew > dateOld) {
      instance.count = 0;
      instance.date = dateNew;
    } else {
      instance.count += 1;
    }
    instance.total += 1;
    await this.countRepo.save(instance);
  }

  async sendMail(dto: MailBasicDto): Promise<TaskRes> {
    let task: TaskRes = null;
    await this.mailerService
      .sendMail({
        ...dto
      })
      .catch((e) => {
        task = PublicModules.fun_makeResError(e, 'SEND_MAIL_ERROR');
      }).then((data) => {
        task = PublicModules.fun_makeResCreateSucc(data);
      });

    return task;
  }
}