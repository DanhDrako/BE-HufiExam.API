import { Injectable } from '@nestjs/common';
import { TaskRes } from 'src/common/Classess';
import { LEN_OF_FIELDS } from 'src/common/Enums';
import { PublicModules } from 'src/common/PublicModules';
import { CreateSupportDto } from './dto/create-support.dto';
import * as Dics from 'src/common/MyDictionary.json';
import { Connection, Repository } from 'typeorm';
import { Support } from 'src/entities/support.entity';
import { plainToClass } from 'class-transformer';
import { GetSupportDto } from './dto/GetSupportQuery.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class SupportService {
  private supRepo: Repository<Support> = null;

  constructor(
    private readonly connection: Connection,
    private readonly authService: AuthService,
  ) {
    this.supRepo = this.connection.getRepository(Support);
  }

  async create(req: any, dto: CreateSupportDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // check lengh.
    dto.title = dto.title.trim();
    dto.message = dto.message.trim();
    if (dto.title.length == 0 || dto.title.length > LEN_OF_FIELDS.LENGTH_MEDIUM
      || dto.message.length == 0 || dto.message.length > LEN_OF_FIELDS.LENGTH_HEIGHT
      || dto.title === 'string' || dto.message === 'string') {
      task = PublicModules.fun_makeResError(null, Dics.BAD_REQUEST);
      return task;
    }
    const agoDate = new Date(new Date().toDateString());
    agoDate.setDate(agoDate.getDate() - 1);

    // if (!dto.idSupportFather) {
    //   // check limit
    //   const count = await this.supRepo.createQueryBuilder('supp')
    //     .innerJoin('supp.user', 'user')
    //     .where('user.id = :id', { id: user.id })
    //     .andWhere('supp.createAt >= :date', { date: agoDate })
    //     .getCount();

    //   if (count > 2) {
    //     task = PublicModules.fun_makeResError('< 2 Suggestion/2Day', Dics.LIMIT_REQUEST);
    //     return task;
    //   }
    // }

    const newSupp = plainToClass(Support, { ...dto, user: req.user });
    const result = await this.supRepo.save(newSupp);
    result.user = PublicModules.fun_secureUser(result.user);
    task = PublicModules.fun_makeResCreateSucc(result);

    return task;
  }

  private optimizeSupportRes = (v: Support) => {
    return Object.assign({}, {
      id: v.id,
      title: v.title,
      message: v.message,
      createAt: v.createAt,
      user: {
        id: v.user.id,
        userName: v.user.username,
        displayName: v.user.displayName,
        email: v.user.email,
        linkFacebook: v.user.linkFacebook,
        avatar: v.user.avatar,
        avatarUploadType: v.user.avatarUploadType,
        isOnline: v.user.isOnline,
      }
    });
  }

  async gets(req: any, query: GetSupportDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // default value
    const page = query.page || 1;
    const limit = query.limit || 10;

    const qb = this.supRepo.createQueryBuilder('sup')
      .innerJoinAndSelect('sup.user', 'user')
      .where('sup.idSupportFather IS NULL')
      .orWhere('sup.idSupportFather = 0')
      .orderBy('sup.createAt', 'DESC');

    const total = await qb.getCount();
    const finds = await qb
      .skip((page - 1) * limit).take(limit).getMany();

    // optimize data response
    const result = [];
    let v: Support = null;
    let map = null;
    for (let i = 0; i < finds.length; i++) {
      v = finds[i];
      const reps = await this.supRepo.createQueryBuilder('reps')
        .innerJoinAndSelect('reps.user', 'user')
        .where('reps.idSupportFather IS NOT NULL')
        .andWhere('reps.idSupportFather != 0')
        .andWhere('reps.idSupportFather = :idSupportFather', { idSupportFather: v.id })
        .orderBy('reps.createAt', 'DESC')
        .skip(0)
        .take(10)
        .getMany();
      map = this.optimizeSupportRes(v);
      map['replys'] = reps.map((k) => {
        return this.optimizeSupportRes(k);
      });
      result.push(map);
    }

    task = PublicModules.fun_makeResListSucc(result, total, null);

    return task;
  }
}
