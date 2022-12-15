import { HttpStatus, NotFoundException } from "@nestjs/common";
import { TaskRes } from "./Classess";
import * as Dics from './MyDictionary.json'
import { PassportModule } from "@nestjs/passport";
import { join } from "path";
import { uuid } from "uuidv4";
import { User } from "src/entities/user.entity";
import { plainToClass } from "class-transformer";
import axios from 'axios';
const moment = require('moment');
require("dotenv").config({ path: '.env' });


const fs = require('fs');

const https = require('https');
const Agent = new https.Agent({
  rejectUnauthorized: false
});
const axiosInstance = axios.create({
  baseURL: process.env.APP_BACK_END_NFT,
  timeout: 200000,
  withCredentials: true,
});
axiosInstance.defaults.httpsAgent = Agent;


export class PublicModules {


  static APP_NAME = process.env.APP_NAME || 'App By VSL';
  static APP_FRONT_END = process.env.APP_FRONT_END || 'Fron-End App By VSL';

  static TOKEN_SECRETKEY = process.env.TOKEN_SECRETKEY;
  static TOKEN_EXPIRESIN = process.env.TOKEN_EXPIRESIN;
  static TOKEN_REFRESH_EXPIRESIN = process.env.TOKEN_REFRESH_EXPIRESIN;
  static TOKEN_ACTIVE_ACCOUNT_EXPIRESIN = process.env.TOKEN_ACTIVE_ACCOUNT_EXPIRESIN;

  static PASSPORT_MODULE = PassportModule.register({
    defaultStrategy: 'jwt',
    property: 'user',
    session: false,
  });
  
  static checkNULL = (obj: any, name: string = '') => {
    if (!obj)
      throw new NotFoundException(`${name} Not Found!`);
  };

  static fun_isLengthToLong = (str: string, len: number) => {
    const task = new TaskRes();
    str = str.trim();
    if (str == null || str.length == 0 || str.length > len) {
      task.statusCode = HttpStatus.LENGTH_REQUIRED;
      task.success = false;
      task.message = Dics.LEN_TOO_LONG;
      task.bonus = `Length: ${str.length} / ${len}`;
      return task;
    }

    return null;
  }

  static fun_makeResCreateSucc = (result: any) => {
    const task = new TaskRes();
    task.statusCode = HttpStatus.CREATED;
    task.success = true;
    task.message = Dics.CREATE_SUCC;
    task.result = result;
    return task;
  }

  static fun_makeResCreateErr = (result: any) => {
    const task = new TaskRes();
    task.statusCode = HttpStatus.NOT_FOUND;
    task.success = false;
    task.message = Dics.CREATE_ERR;
    task.result = result;
    return task;
  }

  static fun_makeResUpdateSucc = (result: any) => {
    const task = new TaskRes();
    task.statusCode = HttpStatus.CREATED;
    task.success = true;
    task.message = Dics.UPDATE_SUCC;
    task.result = result;
    return task;
  }

  static fun_makeResFoundSucc = (result: any) => {
    const task = new TaskRes();
    task.statusCode = HttpStatus.OK;
    task.success = true;
    task.message = Dics.FOUND_OK;
    task.result = result;
    return task;
  }

  static fun_makeResNotFound = (bonus: any, name: string = '') => {
    const task = new TaskRes();
    task.statusCode = HttpStatus.NOT_FOUND;
    task.success = false;
    task.message = `${name} ${Dics.NOT_FOUND}`;
    task.bonus = bonus;
    return task;
  }

  static fun_makeResAlreadyExist = (bonus: any, name: string = '') => {
    const task = new TaskRes();
    task.statusCode = HttpStatus.FOUND;
    task.success = false;
    task.message = `${name} ${Dics.ALREADY_EXIST}`;
    task.bonus = bonus;
    return task;
  }

  static fun_makeResDeleteSucc = (result: any) => {
    const task = new TaskRes();
    task.statusCode = HttpStatus.CREATED;
    task.success = true;
    task.message = Dics.DELETE_SUCC;
    task.result = result;
    return task;
  }

  static fun_makeResListSucc = (list: Array<any>, total?: number, bonus?: any) => {
    const task = new TaskRes();
    task.statusCode = HttpStatus.OK;
    task.success = true;
    task.message = Dics.FOUND_OK;
    task.result = list;
    if (total || total >= 0) {
      task.total = total;
    } else {
      task.total = list.length;
    }
    if (bonus) {
      task.bonus = bonus;
    }

    return task;
  };

  static fun_makeResError = (bonus: any, mess: any, result: any = null) => {
    const task = new TaskRes();
    task.statusCode = HttpStatus.FAILED_DEPENDENCY;
    task.success = false;
    if (mess)
      task.message = mess;
    else
      task.message = Dics.FAILED_DEPENDENCY;
    if (result)
      task.result = result;
    else task.bonus = bonus;
    return task;
  }

  static fun_isLetter = (char: string) => {
    return char.length === 1 && char.match(/[a-z]/i);
  }

  static fun_isLetterVN = (char: string) => {
    return char.length === 1 && char.match(/[a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹế]/i);
  }

  static fun_isDigit = (char: string) => {
    return /^\d+$/.test(char);
  }

  static fun_isValidPassword = (passwordCheck: string) => {
    let task: TaskRes = null;
    let valid = false;
    if (passwordCheck == null || passwordCheck.trim().length < 6) {
      task = PublicModules.fun_makeResError('To Protect Password ...', Dics.PASSWORD_NON_VALID);
      return task;
    }
    passwordCheck = passwordCheck.trim();
    let countLetter = 0;
    let countDigit = 0;
    for (let i = 0; i < passwordCheck.length; i++) {
      const ch = passwordCheck.charAt(i);
      if (PublicModules.fun_isDigit(ch)) {
        countDigit += 1;
      }
      if (PublicModules.fun_isLetter(ch)) {
        countLetter += 1;
      }
    }

    valid = countLetter != 0 && countDigit != 0;
    if (valid) {
      task = PublicModules.fun_makeResCreateSucc(valid);
      return task;
    }

    task = PublicModules.fun_makeResError('To Protect Password ...', Dics.PASSWORD_NON_VALID);
    return task;
  };

  static fun_getTimeStamp = ({ isISO = false }) => {
    if (isISO)
      return new Date().toISOString();
    return new Date().getTime();
  }

  static fun_getUuid = () => {
    return uuid();
  }

  static fun_renameImage = (originFileName: string) => {
    const fN = originFileName;
    const ext = fN.substring(fN.lastIndexOf('.'), fN.length);
    let newFileName = process.env.APP_NAME + '_' + PublicModules.fun_getTimeStamp({ isISO: true });
    newFileName = newFileName.replace(new RegExp(':', 'g'), '-');
    newFileName += PublicModules.fun_getUuid();
    newFileName += ext;
    return newFileName;
  }

  static fun_saveFile = async (fileName: string, data: any, folder: string = '/uploads/images/') => {
    return new Promise((resolve, reject) => {
      const path = join(process.cwd(), folder);
      const fs = require('fs');
      // folder exists ?
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }

      fs.writeFile(path + fileName, data, (err: any) => {
        if (err)
          reject(err);
        else
          resolve(fileName);
      })
    });
  };

  static fun_removeFileIfExists(fileName: string, folder: string = '/uploads/images/') {
    try {
      const path = join(process.cwd(), folder);
      const fs = require('fs');
      fs.unlinkSync(path + fileName);

      return true;
    } catch (_e) {
      return false;
    }
  }

  static fun_changeToSlug = (title: string) => {
    var slug: string;
    slug = title.toLowerCase();
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    slug = slug.replace(/đ/gi, 'd');
    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
    slug = slug.replace(/ /gi, "-");
    slug = slug.replace(/\-\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-/gi, '-');
    slug = slug.replace(/\-\-/gi, '-');
    slug = '@' + slug + '@';
    slug = slug.replace(/\@\-|\-\@|\@/gi, '');
    return slug;
  }

  static fun_genNewCodeActive(length: number = 6) {
    let result = '';
    for (let i = 0; i < length; i++)
      result += Math.floor(Math.random() * 10);
    return result;
  }

  static fun_getCurrentTimestampUTC_Moment() {
    var current = moment().utc().valueOf();
    return (current - current % 1000) / 1000;
  }

  static fun_getCurrentTimestampUTC_MomentViewUTC() {
    return moment().utc().format('YYYY/MM/DD hh:mm:ss') + ' +UTC';
  }

  static fun_secureUser(user: User) {
    return plainToClass(User, {
      ...user,
      accessToken: '',
      isActive: '',
      password: '',
      deleteAt: '',
    });
  }
  
  static fun_get = async (api: string, config: any = {}, token: string = null) => {
    if (token)
      config['headers'] = { Authorization: `Bearer ${token}` };

    const res = await axiosInstance.get(
      api,
      config,
    ).catch((_err) => {
      const task = PublicModules.fun_makeResError(Dics.UNAUTHORIZED, api, {
        status: 401,
        message: Dics.UNAUTHORIZED,
      });
      return { data: task };
    });

    return res.data;
  }

  static fun_post = async (api: string, data: any = null, config: any = {}, token: string = null) => {
    if (token)
      config['headers'] = { Authorization: `Bearer ${token}` };

    const res = await axiosInstance.post(
      api,
      data,
      config,
    ).catch((_err) => {
      console.log(_err);

      const task = PublicModules.fun_makeResError(Dics.UNAUTHORIZED, api, {
        status: 401,
        message: Dics.UNAUTHORIZED,
      });
      return { data: task };
    });
    return res.data;
  }

  static fun_put = async (api: string, data: any = null, config: any = {}, token: string = null) => {
    if (token)
      config['headers'] = { Authorization: `Bearer ${token}` };

    const res = await axiosInstance.put(
      api,
      data,
      config,
    ).catch((_err) => {
      const task = PublicModules.fun_makeResError(Dics.UNAUTHORIZED, api, {
        status: 401,
        message: Dics.UNAUTHORIZED,
      });
      return { data: task };
    });
    return res.data;
  }

  static fun_delete = async (api: string, config: any = {}, token: string = null) => {
    if (token)
      config['headers'] = { Authorization: `Bearer ${token}` };

    const res = await axiosInstance.delete(
      api,
      config,
    ).catch((_err) => {
      const task = PublicModules.fun_makeResError(Dics.UNAUTHORIZED, api, {
        status: 401,
        message: Dics.UNAUTHORIZED,
      });
      return { data: task };
    });
    return res.data;
  }
}
