import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { Connection, Repository } from 'typeorm';
import { JwtPayload } from './dto/JwtPayload';
import * as Dics from 'src/common/MyDictionary.json';
import { PublicModules } from 'src/common/PublicModules';
import { JwtService } from '@nestjs/jwt';
import { IMAGE_UPLOAD_TYPE, RolerUser } from 'src/common/Enums';
import { LoginDto } from './dto/login.dto';
import { TaskRes } from 'src/common/Classess';
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  private userRepo: Repository<User> = null;

  constructor(
    private readonly connection: Connection,
    private readonly jwtService: JwtService,
  ) {
    this.userRepo = this.connection.getRepository(User);
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const { email, password } = payload;
    const user = await this.userRepo.findOne({ where: { email: email } });
    if (!user) throw new UnauthorizedException();
    // pass correct ?
    const isPass = password === user.password;
    if (!isPass) throw new UnauthorizedException();

    return user;
  }

  async verifyToken(token: string) {
    let task: TaskRes = null;
    try {
      const result = await this.jwtService.verifyAsync(token, { secret: PublicModules.TOKEN_SECRETKEY });
      task = PublicModules.fun_makeResFoundSucc(result);
    } catch (e) {
      task = PublicModules.fun_makeResError(e, 'TOKEN_INVALID');
    }

    return task;
  }

  async createToken(dataSign: any, exp: any = PublicModules.TOKEN_EXPIRESIN) {
    const payLoad = { ...dataSign };
    const token = await this.jwtService.signAsync(payLoad, { expiresIn: exp });
    return token;
  }

  seedDefaultAdmin(userName: string, email: string, password: string) {
    this.userRepo.findOne({ where: { username: userName } })
      .then((find) => {
        // ignore ?
        if (find) return;
        find = this.userRepo.create();
        find.displayName = 'Display name default';
        find.username = userName;
        find.password = password;
        find.email = email;
        find.role = RolerUser.ADMIN,
          find.niceName = 'Nice name default';
        //save
        this.userRepo.save(find);
      });
  }

  seedDefaultMod(userName: string, email: string, password: string) {
    this.userRepo.findOne({ where: { username: userName } })
      .then((find) => {
        // ignore ?
        if (find) return;
        find = this.userRepo.create();
        find.displayName = 'Display name default';
        find.username = userName;
        find.password = password;
        find.email = email;
        find.role = RolerUser.MOD,
          find.niceName = 'Nice name default';
        //save
        this.userRepo.save(find);
      });
  }

  seedDefaultMem(userName: string, email: string, password: string) {
    this.userRepo.findOne({ where: { username: userName } })
      .then((find) => {
        // ignore ?
        if (find) return;
        find = this.userRepo.create();
        find.displayName = 'Display name default';
        find.username = userName;
        find.password = password;
        find.email = email;
        find.role = RolerUser.MEM,
          find.niceName = 'Nice name default';
        //save
        this.userRepo.save(find);
      });
  }

  async login(req: any, dto: LoginDto) {
    let task: TaskRes = null;
    const isAuthClient = this.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;

    const find = await this.userRepo.findOne({ where: { email: dto.email } });
    // exists ?
    if (!find) {
      task = PublicModules.fun_makeResNotFound(null, 'EMAIL');
      return task;
    }
    if (!find.isActive) {
      task = PublicModules.fun_makeResError(null, Dics.USER_UNACTIVE);
      return task;
    }
    // pass correct ?
    const isPass = bcrypt.compareSync(dto.password, find.password);
    if (!isPass) {
      task = PublicModules.fun_makeResError(null, Dics.PASSWORD_NON_VALID);
      return task;
    }

    // ok
    const token = await this.createToken(find);
    const refresh = await this.createToken(find, PublicModules.TOKEN_REFRESH_EXPIRESIN);
    const result = Object.assign({}, {
      gaurd: {
        token: token,
        refresh: refresh,
      },
      user: PublicModules.fun_secureUser(find),
    });
    task = PublicModules.fun_makeResCreateSucc(result);

    return task;
  }

  me(req: any) {
    let task: TaskRes = null;
    const isAuthClient = this.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    task = PublicModules.fun_makeResFoundSucc(PublicModules.fun_secureUser(req.user));
    return task;
  }

  async refresh(req: any) {
    let task: TaskRes = null;
    const isAuthClient = this.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;

    const find = req.user;
    const token = await this.createToken(find);
    const refresh = await this.createToken(find, PublicModules.TOKEN_REFRESH_EXPIRESIN);
    const result = Object.assign({}, {
      gaurd: {
        token: token,
        refresh: refresh,
      },
      user: PublicModules.fun_secureUser(find),
    });
    task = PublicModules.fun_makeResCreateSucc(result);

    return task;
  }

  async facebookLoginOrCreate(user: any) {
    let task: TaskRes = null;
    const {
      id,
      email,
      avatar,
      firstName,
      lastName,
    } = user.user;
    const accessToken = user.accessToken;
    let userFind = await this.userRepo.findOne({ where: { email: email } });
    let result = null;
    // create user
    if (!userFind) {
      userFind = this.userRepo.create();
      userFind.email = email;
      userFind.username = firstName + lastName + id;
      userFind.displayName = firstName + ' ' + lastName;
      userFind.password = bcrypt.hashSync(email + firstName + lastName + accessToken + PublicModules.TOKEN_SECRETKEY, 10);
    }
    userFind.accessToken = accessToken;
    userFind.isActive = true;
    // userFind.role = RolerUser.MEM;
    await this.userRepo.save(userFind);

    // ok
    const token = await this.createToken(userFind);
    const refresh = await this.createToken(userFind, PublicModules.TOKEN_REFRESH_EXPIRESIN);
    result = Object.assign({}, {
      gaurd: {
        token: token,
        refresh: refresh,
      },
      user: PublicModules.fun_secureUser(userFind),
    });
    task = PublicModules.fun_makeResCreateSucc(result);

    return task;
  }

  async googleLoginOrCreate(user: any) {
    let task: TaskRes = null;
    const {
      email,
      picture: avatar,
      firstName,
      lastName,
      accessToken,
    } = user;
    let userFind = await this.userRepo.findOne({ where: { email: email } });
    let result = null;
    // create user
    if (!userFind) {
      userFind = this.userRepo.create();
      userFind.email = email;
      userFind.username = email;
      userFind.displayName = firstName + ' ' + lastName;
      userFind.avatar = avatar;
      userFind.avatarUploadType = IMAGE_UPLOAD_TYPE.GOOGLE_AVATAR;
      userFind.password = bcrypt.hashSync(email + firstName + lastName + accessToken + PublicModules.TOKEN_SECRETKEY, 10);
    }
    userFind.accessToken = accessToken;
    userFind.isActive = true;
    if (!userFind.avatar && avatar) {
      userFind.avatar = avatar;
      userFind.avatarUploadType = IMAGE_UPLOAD_TYPE.GOOGLE_AVATAR;
    }
    // userFind.role = RolerUser.MEM;
    await this.userRepo.save(userFind);

    // ok
    const token = await this.createToken(userFind);
    const refresh = await this.createToken(userFind, PublicModules.TOKEN_REFRESH_EXPIRESIN);
    result = Object.assign({}, {
      gaurd: {
        token: token,
        refresh: refresh,
      },
      user: PublicModules.fun_secureUser(userFind),
    });
    task = PublicModules.fun_makeResCreateSucc(result);

    return task;
  }



  checkAuthFromClient(_req: any) {
    const taskOk = PublicModules.fun_makeResFoundSucc('CHECK_CLIENT_OK');
    return taskOk;
    // const taskErr = PublicModules.fun_makeResError('Hiện tại hệ thống API chưa mở, nên sẽ bị tạm dừng ngay tại đây, bạn không thể truy cập sâu vào hơn được nửa',
    //   'Yêu cầu của bạn đã bị chặn tại đây!');

    // let task: TaskRes = null;
    // try {
    //   let request_name = req.headers.request_name;
    //   const time1 = req.headers.request_time_from;
    //   const time2 = req.headers.request_time_to;
    //   const current = PublicModules.fun_getCurrentTimestampUTC_Moment();
    //   if (!request_name || current < time1 || current > time2) return taskErr;
    //   const APP_NAME = 'MY-HUFIER_';
    //   let data = `*100*${time2}|${APP_NAME}_${time1}_${process.env.REACT_APP_DATA_TYPE_MY_HUFIER}|${time1}#`;
    //   request_name = request_name.replace(APP_NAME, '$2a$10$');

    //   // compare
    //   const isCompare = bcrypt.compareSync(data, request_name);
    //   if (isCompare)
    //     task = taskOk;
    //   else
    //     task = taskErr;
    //   return task;
    // } catch (_err) {
    //   return taskErr;
    // }
  }

  checkAuthFromClientV2(body: any) {
    const taskOk = PublicModules.fun_makeResFoundSucc('CHECK_CLIENT_OK');
    const taskErr = PublicModules.fun_makeResError('Hiện tại hệ thống API chưa mở, nên sẽ bị tạm dừng ngay tại đây, bạn không thể truy cập sâu vào hơn được nửa',
      'Yêu cầu của bạn đã bị chặn tại đây!');

    let task: TaskRes = null;
    try {
      let request_name = body.request_name;
      const time1 = body.request_time_from;
      const time2 = body.request_time_to;
      const current = PublicModules.fun_getCurrentTimestampUTC_Moment();
      if (!request_name || current < time1 || current > time2) return taskErr;
      const APP_NAME = 'MY-HUFIER_';
      let data = `*100*${time2}|${APP_NAME}_${time1}_${process.env.REACT_APP_DATA_TYPE_MY_HUFIER}|${time1}#`;
      request_name = request_name.replace(APP_NAME, '$2a$10$');

      // compare
      const isCompare = bcrypt.compareSync(data, request_name);
      if (isCompare)
        task = taskOk;
      else
        task = taskErr;
      return task;
    } catch (_err) {
      return taskErr;
    }
  }

  validate_And_Decode_TokenUser = async (token: string) => {
    let taskErr = PublicModules.fun_makeResError(null, Dics.UNAUTHORIZED, {
      status: 401,
      message: Dics.UNAUTHORIZED,
    });
    let payLoad: any = null;
    try {
      payLoad = await this.jwtService.verifyAsync(token, {
        secret: PublicModules.TOKEN_SECRETKEY,
      });
    } catch (e) {
      return taskErr;
    }
    const { email, password } = payLoad;
    const user = await this.userRepo.findOne({ where: { email: email } });
    if (!user) return taskErr;
    // pass correct ?
    const isPass = password === user.password;
    if (!isPass) return taskErr;

    return PublicModules.fun_makeResFoundSucc(user);
  };
}
