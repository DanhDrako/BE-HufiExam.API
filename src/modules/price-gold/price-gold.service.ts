import { TaskRes } from './../../common/Classess';
import { PriceGold } from './../../entities/price-gold.entity';
import { Repository, Connection } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { PublicModules } from 'src/common/PublicModules';
import { FilterQueryPriceGold } from './dto/FilterQueryPriceGold';

import { MailBasicDto } from '../core/mail/dto/mail-basic.dto';
import { ServerCheckTemplate } from '../core/mail/templates/ServerCheckTemplate';
import { MailService } from '../core/mail/mail.service';


//set time
const TIME_INTERVAL_FIRST_CHECK = Number.parseInt(process.env.SET_TIME_CHECK_SERVER) * 1000;
//set time around
const TIME_INTERVAL_SECONDS_CHECK = Number.parseInt(process.env.SET_TIME_AROUND_CHECK_SERVER) * 1000;
// Hien tai server co bi down hay ko ?
let IS_CURRENT_SERVER_DOWN = false;
// Em cho cai bien nay de dung chung cho 2 interval luon.
let INTERVAL_CHECK_SERVER = null;
let isError = false;

@Injectable()
export class PriceGoldService {
  private priceGoldRepo: Repository<PriceGold> = null;
  private logger = new Logger(PriceGoldService.name, true);

  constructor(
    private readonly connection: Connection,
    private readonly mailService: MailService,
  ) {
    this.priceGoldRepo = this.connection.getRepository(PriceGold);
    this.create();
    this.deleteWhere();
    //this.setIntervalCheckServer(
      //{ danh: 'danhdc2001@gmail.com' },
      //process.env.SET_URL_SERVER_CHECK,
    //);
  }

  async crawlDataInsertDB() {
    let task: TaskRes = null;
    const url = 'https://sjc.com.vn/xml/tygiavang.xml';

    const dataXml = await PublicModules.fun_get(url);
    let resultData;
    const xml2js = require('xml2js');

    xml2js.parseString(dataXml, (err, result) => {
      if (err) {
        throw err;
      }

      const json = JSON.stringify(result, null, 4);
      const obj = JSON.parse(json);
      const updated = obj.root.ratelist[0].$.updated;

      obj.root.ratelist[0].city.map((v, k) => {
        v.item.forEach(async e => {
          let find = await this.priceGoldRepo.findOne({
            where: {
              province: v.$.name,
              typeGold: e.$.type,
              sell: e.$.sell,
              buy: e.$.buy,
              dateUpdated: updated.toString(),
            },
          });
          if (!find) {
            const newData = this.priceGoldRepo.create();
            newData.province = v.$.name;
            newData.buy = e.$.buy;
            newData.sell = e.$.sell;
            newData.typeGold = e.$.type;
            newData.dateUpdated = updated.toString();
            resultData = await this.priceGoldRepo.save(newData);
            task = PublicModules.fun_makeResCreateSucc(resultData);
          } else {
            find.updateAt = new Date(new Date());
            resultData = await this.priceGoldRepo.save(find);
          }
        });
      });
    });
    return task;
  }

  deleteWhere() {
    setInterval(async () => {
      let task: TaskRes = null;
      const start = new Date();
      const end = new Date();
      const monthNow = new Date().getMonth();
      start.setMonth(monthNow - 6);
      end.setMonth(monthNow - 3);

      const resD = await this.priceGoldRepo.createQueryBuilder()
        .delete()
        .from('PriceGold')
        .where('updateAt BETWEEN :start AND :end', {
          start,
          end,
        })
        .execute();
      task = PublicModules.fun_makeResDeleteSucc(resD);
      return task;
    }, 1800 * 1000);
  }

  async create() {
    setInterval(() => {
      this.crawlDataInsertDB();
    }, Number.parseInt(process.env.SET_TIME_SECOND_PRICE_GOLD) * 1000);
  }

  async findAll(query: FilterQueryPriceGold) {
    let task: TaskRes = null;
    // const data = await this.priceGoldRepo.find();

    const dayQuery = query.day || 1;
    const province = query.province || 'Hồ Chí Minh';

    let dayNow = new Date().getDate();
    let monthNow = new Date().getMonth();

    let start = new Date();
    let end = new Date();

    let qb = this.priceGoldRepo
      .createQueryBuilder('PriceGold')
      .orderBy('PriceGold.updateAt', 'ASC');

    if (province) {
      qb.andWhere('PriceGold.province = :province', { province });
    }

    if (dayQuery >= 1 && dayQuery <= 7) {
      dayNow = dayNow - dayQuery;

      if (dayNow != 0) {
        start.setDate(dayNow);
      }
      if (dayNow <= 0) {
        start.setMonth(monthNow - 1);
      }
      qb = qb.andWhere('PriceGold.updateAt BETWEEN :start AND :end', {
        start,
        end,
      });
    }

    if (dayQuery == 30) {
      start.setMonth(monthNow - 1);
      qb = qb.andWhere('PriceGold.updateAt BETWEEN :start AND :end', {
        start,
        end,
      });
    }

    if (dayQuery == 90) {
      start.setMonth(monthNow - 3);
      qb = qb.andWhere('PriceGold.updateAt BETWEEN :start AND :end', {
        start,
        end,
      });
    }

    const data = await qb.getMany();
    task = PublicModules.fun_makeResListSucc(data);
    return task;
  }

  setIntervalCheckServer(toMail: any, url: string) {
    this.startNewIntervalCheckServer(TIME_INTERVAL_FIRST_CHECK, toMail, url);
  }

  startNewIntervalCheckServer(interval_milis: number, toMail: any, url: string) {
    INTERVAL_CHECK_SERVER = setInterval(async () => {
      isError = await this.isServerError(url);
      if (!isError)
        this.logger.log(`[ ^:^ Is Server Error: ${isError} ^:^ ]`);
      else
        this.logger.log(`[ (@.@) Is Server Error: ${isError} (@.@) ]`);
      // Server Error ?
      if (isError) {
        //this.sendEmailCheck(toMail.danh, url);
        if (!IS_CURRENT_SERVER_DOWN) {
          IS_CURRENT_SERVER_DOWN = true;
          clearInterval(INTERVAL_CHECK_SERVER);
          this.startNewIntervalCheckServer(TIME_INTERVAL_SECONDS_CHECK, toMail, url);
        }
      } else {
        if (IS_CURRENT_SERVER_DOWN) {
          IS_CURRENT_SERVER_DOWN = false;
          clearInterval(INTERVAL_CHECK_SERVER);
          this.startNewIntervalCheckServer(TIME_INTERVAL_FIRST_CHECK, toMail, url);
        }
      }
    }, interval_milis);
  }

  async isServerError(url: string) {
    const resCheck = await PublicModules.fun_get(url);
    if (!resCheck || (resCheck && typeof resCheck === 'object' && Number(resCheck.result.status) !== 200)) {
      return true;
    }
    return false;
  }

  async sendEmailCheck(
    toMail: string,
    url: string,
    desc = 'Your server is currently down, please check',
  ) {
    const title = 'This server is down';
    const dtoMail: MailBasicDto = new MailBasicDto();
    dtoMail.to = toMail;
    dtoMail.subject = 'Server your die';
    dtoMail.html = ServerCheckTemplate.newInstance().getTemplate(
      toMail,
      url,
      title,
      desc,
    );
    await this.mailService.sendMail(dtoMail);
  }
}
