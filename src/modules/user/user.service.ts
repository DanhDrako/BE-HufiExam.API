import { Injectable } from '@nestjs/common';
import { TaskRes } from 'src/common/Classess';
import { PublicModules } from 'src/common/PublicModules';
import { User } from 'src/entities/user.entity';
import { Connection, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as Dics from 'src/common/MyDictionary.json';
import { plainToClass } from 'class-transformer';
import { MailService } from '../core/mail/mail.service';
import { MailBasicDto } from '../core/mail/dto/mail-basic.dto';
import { AuthService } from '../auth/auth.service';
import { Counts } from 'src/entities/counts.entity';
import { ResetPasswordTemplate } from '../core/mail/templates/ResetPasswordTemplate';
import { LEN_OF_FIELDS, RolerUser } from 'src/common/Enums';
import { ActiveAccountTemplate } from '../core/mail/templates/ActiveAccountTemplate';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { FilterUserDto } from './dto/filter-user.dto';
import { User2userMessageService } from '../user2user-message/user2user-message.service';

@Injectable()
export class UserService {
  private userRepo: Repository<User> = null;

  constructor(
    private readonly connection: Connection,
    private readonly mailService: MailService,
    private readonly authService: AuthService,
    private readonly u2uMessService: User2userMessageService,
  ) {
    this.userRepo = this.connection.getRepository(User);
  }

  async create(req: any, dto: CreateUserDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const displayName = dto.displayName || '';
    // check length
    if (displayName.length > LEN_OF_FIELDS.LENGTH_LOW
      || dto.email.length > LEN_OF_FIELDS.LENGTH_LOW
      || dto.username.length > LEN_OF_FIELDS.LENGTH_LOW
      || dto.password.length > LEN_OF_FIELDS.LENGTH_LOW
    ) {
      task = PublicModules.fun_makeResError(null, Dics.LEN_TOO_LONG);
      return task;
    }

    // check password
    const isPassValid = PublicModules.fun_isValidPassword(dto.password);
    if (!isPassValid.success) return isPassValid;

    // check user name
    for (let i = 0; i < dto.username.length; i++)
      if (!PublicModules.fun_isLetter(dto.username[i]) && !PublicModules.fun_isDigit(dto.username[i])) {
        task = PublicModules.fun_makeResError(null, Dics.USERNAME_NON_VALID);
        return task;
      }

    // check limit register of day
    const instanceCountMail = await this.mailService.getCountOfDay();
    if (instanceCountMail.count >= this.mailService.MAX_OF_DATE - 1) {
      task = PublicModules.fun_makeResError(null, Dics.SEND_MAIL_LIMIT);
      return task;
    }

    // user name
    let find = await this.userRepo.findOne({ where: { username: dto.username } });
    if (find) {
      task = PublicModules.fun_makeResError(null, Dics.USERNAME_FOUND);
      return task;
    }

    // find email
    find = await this.userRepo.findOne({ where: { email: dto.email } });
    if (find) {
      if (find.isActive) {
        task = PublicModules.fun_makeResError(null, Dics.EMAIL_FOUND);
        return task;
      } else {
        find.displayName = dto.displayName;
        find.role = RolerUser.MEM;
        find = await this.userRepo.save(find);
        task = PublicModules.fun_makeResCreateSucc(find);
        // send mail
        this.sendMailActive(dto.email, instanceCountMail, find);
        return task;
      }
    }

    // add new
    find = plainToClass(User, dto);
    find.role = RolerUser.MEM;
    find = await this.userRepo.save(find);
    find = PublicModules.fun_secureUser(find);
    task = PublicModules.fun_makeResCreateSucc(find);

    // send mail
    this.sendMailActive(dto.email, instanceCountMail, find);

    return task;
  }

  async sendMailActive(toMail: string, instanceCountMail: Counts, account: User) {
    // code active
    const codeActive = await this.authService.createToken(account, PublicModules.TOKEN_ACTIVE_ACCOUNT_EXPIRESIN);

    // count ++
    await this.mailService.increeCount(instanceCountMail);
    // send mail
    const dtoMail: MailBasicDto = new MailBasicDto();
    dtoMail.to = toMail;
    dtoMail.subject = 'Active Your Account';
    dtoMail.html = ActiveAccountTemplate.newInstance().getTemplate(
      toMail,
      `${PublicModules.APP_FRONT_END}/user/active/${codeActive}`,
      PublicModules.APP_FRONT_END,
    );
    this.mailService.sendMail(dtoMail);
  }

  async active(req: any, token: string) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const ischeck = await this.authService.verifyToken(token);
    if (!ischeck.success) return ischeck;
    const user = await this.userRepo.findOne({ where: { id: ischeck.result.id } });
    if (user.isActive) {
      task = PublicModules.fun_makeResCreateSucc('USER_AREADY_ACTIVE');
      return task;
    }
    user.isActive = true;
    // user.role = RolerUser.MEM;
    let result = await this.userRepo.save(user);
    result = PublicModules.fun_secureUser(result);
    task = PublicModules.fun_makeResCreateSucc(result);

    return task;
  }

  async gets(req: any) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    task = PublicModules.fun_makeResListSucc(await this.userRepo.find({ take: 10 }));

    return task;
  }

  async resetPassword(req: any, email: string) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    if (!email.includes('@')) {
      task = PublicModules.fun_makeResError(null, Dics.EMAIL_NON_VALID);
      return task;
    }

    const user = await this.userRepo.findOne({ where: { email: email } });
    if (!user) {
      task = PublicModules.fun_makeResNotFound(email, 'EMAIL');
      return task;
    }

    const mailCounts = await this.mailService.getCountOfDay();
    if (mailCounts.count > this.mailService.MAX_OF_DATE - 1) {
      task = PublicModules.fun_makeResError(null, Dics.SEND_MAIL_LIMIT);
      return task;
    }

    // count ++
    await this.mailService.increeCount(mailCounts);

    // code active
    const code = await this.authService.createToken(user, PublicModules.TOKEN_ACTIVE_ACCOUNT_EXPIRESIN);

    // send mail
    const dtoMail = new MailBasicDto();
    dtoMail.to = email;
    dtoMail.subject = 'Khôi phục tài khoản';
    dtoMail.html = ResetPasswordTemplate.newInstance().getTemplate(
      email,
      PublicModules.APP_FRONT_END + `/user/reset-password/${code}`,
      PublicModules.APP_FRONT_END,
    );
    this.mailService.sendMail(dtoMail);
    task = PublicModules.fun_makeResCreateSucc(dtoMail);

    return task;
  }

  async update(req: any, dto: UpdateUserDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const user = req.user;
    let find = null;
    // check userName
    if (dto.username) {
      find = await this.userRepo.findOne({ where: { username: dto.username } });
      if (find) {
        task = PublicModules.fun_makeResError(null, Dics.USERNAME_FOUND);
        return task;
      }
    }
    // check email
    if (dto.email) {
      find = await this.userRepo.findOne({ where: { email: dto.email } });
      if (find) {
        task = PublicModules.fun_makeResError(null, Dics.EMAIL_FOUND);
        return task;
      }
    }
    if (dto.password) {
      const isValidPass = PublicModules.fun_isValidPassword(dto.password);
      if (!isValidPass.success) return isValidPass;
      const isComparePass = bcrypt.compareSync(dto.oldPasswrod, user.password);
      if (!isComparePass) {
        task = PublicModules.fun_makeResError(null, Dics.PASSWORD_NOT_MATH);
        return task;
      }
      dto.password = bcrypt.hashSync(dto.password, 10);
    }
    if (dto.avatar) {
      // remove old image ?
      if (user.avatar && user.avatar !== dto.avatar)
        PublicModules.fun_removeFileIfExists(user.avatar);
    }
    const newUser = this.userRepo.merge(user, dto);
    // newUser.role = RolerUser.MEM;
    let result = await this.userRepo.save(newUser);
    result = PublicModules.fun_secureUser(result);
    task = PublicModules.fun_makeResUpdateSucc(result);

    return task;
  }

  async resetPasswordByToken(req: any, newPass: string) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const user:User = req.user;
    const isValidPass = PublicModules.fun_isValidPassword(newPass);
    if (!isValidPass.success) return isValidPass;
    user.password = bcrypt.hashSync(newPass, 10);
    // user.role = RolerUser.MEM;
    let result = await this.userRepo.save(user);
    result = PublicModules.fun_secureUser(result);
    task = PublicModules.fun_makeResUpdateSucc(result);

    return task;
  }

  async filter(req: any, filter: FilterUserDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const user:User = req.user;
    let keyWord = filter.keyWord || '';
    if (keyWord.trim() === '')
      keyWord = null;
    const page = filter.page || 1;
    const limit = filter.limit || 10;

    // basic join
    let qb = this.userRepo.createQueryBuilder('user')
      .where('LOWER(user.username) like :username', { username: `%${keyWord.toLowerCase()}%` });

    // total;
    const total = await qb.getCount();

    // page & limit
    qb = qb.skip((page - 1) * limit).take(limit);

    // result;
    const finds = await qb.getMany();
    const result = [];
    let v: User = null;
    let countUnRead = 0;
    for (let i = 0; i < finds.length; i++) {
      v = finds[i];
      countUnRead = await this.u2uMessService.countMessagesUnRead(v.id, user.id);
      result.push(Object.assign({}, {
        id: v.id,
        username: v.username,
        avatar: v.avatar,
        avatarUploadType: v.avatarUploadType,
        countUnRead: countUnRead,
        isOnline: v.isOnline,
      }));
    }
    task = PublicModules.fun_makeResListSucc(result, total, null);

    return task;
  }
}
