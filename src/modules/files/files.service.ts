import { HttpService, Injectable } from '@nestjs/common';
import { TaskRes } from 'src/common/Classess';
import { PublicModules } from 'src/common/PublicModules';
import * as Dics from 'src/common/MyDictionary.json';
import { join } from 'path';
import { TextToJsonDto } from './dto/text2json.dto';
import { LEN_OF_FIELDS } from 'src/common/Enums';
import { PostService } from '../post/post.service';
import { QuestionAnswer } from 'src/entities/question-answer.entity';
import { Connection, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
// const sharp = require("sharp");

@Injectable()
export class FilesService {
  private qAsService: Repository<QuestionAnswer> = null;

  constructor(
    private readonly http: HttpService,
    private readonly postService: PostService,
    private readonly connection: Connection,
    private readonly authService: AuthService,
  ) {
    this.qAsService = this.connection.getRepository(QuestionAnswer);
  }
  async uploadImageToIpfs(req: any, file: Express.Multer.File) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // file ?
    if (!file) {
      task = PublicModules.fun_makeResError(null, 'FILE_NULL');
      return task;
    }

    // upload
    const ipfsAPI = require('ipfs-api');
    const ipfs = ipfsAPI(process.env.IPFS_API_HOST, process.env.IPFS_API_PORT, { protocol: process.env.IPFS_API_PROTOCOL });

    let isError = null;
    const result = await ipfs.add(file.buffer).catch((e: any) => {
      isError = e;
    });

    // error ?
    if (isError) {
      task = PublicModules.fun_makeResError(isError, 'UPLOAD_FILE_ERROR_BY_SERVER');
      return task;
    }

    // success ?
    if (result) {
      const fN = file.originalname;
      let url = process.env.IPFS_API_VIEW_IMAGE;
      const ipfsId = result[0].hash;
      url += ipfsId;
      task = PublicModules.fun_makeResCreateSucc(Object.assign({}, {
        urlView: url,
        fileName: ipfsId + fN.substring(fN.lastIndexOf('.'), fN.length),
      }));
      return task;
    }

    task = PublicModules.fun_makeResError(null, 'UPLOAD_FILE_ERROR_BY_IPFS')
    return task;
  }

  async uploadImageToImgur(req: any, file: Express.Multer.File) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // file ?
    if (!file) {
      task = PublicModules.fun_makeResError(null, 'FILE_NULL');
      return task;
    }

    // upload
    let isError = null;
    // const title = PublicModules.fun_getTimeStamp({isISO: true}) + PublicModules.fun_getUuid();

    let result: any = await this.http.post(
      process.env.IMGUR_API_UPLOAD,
      {
        image: file.buffer.toString('base64'),
        type: 'base64',
        // title: title,
      },
    ).toPromise().catch((e) => {
      isError = e.message;
    });

    // error ?
    if (isError) {
      task = PublicModules.fun_makeResError(isError, 'UPLOAD_FILE_ERROR_BY_SERVER');
      return task;
    }

    // success ?
    result = result.data;
    if (result.success) {
      const fN = file.originalname;
      let url = process.env.IMGUR_API_VIEW;
      const imageID = result.data.id;
      url += imageID;
      const ext = fN.substring(fN.lastIndexOf('.'), fN.length);
      task = PublicModules.fun_makeResCreateSucc(Object.assign({}, {
        urlView: url + ext,
        fileName: imageID + ext,
      }));
      return task;
    }

    task = PublicModules.fun_makeResError(null, 'UPLOAD_FILE_ERROR_BY_IPFS')
    return task;
  }

  async uploadImageToServer(req: any, file: Express.Multer.File, fileName: string = null) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // file ?
    if (!file) {
      task = PublicModules.fun_makeResError(null, 'FILE_NULL');
      return task;
    }

    // rename > file
    if (file.originalname === 'blob')
      file.originalname = 'blob.jpg';
    const newFileName = fileName || PublicModules.fun_renameImage(file.originalname);

    // upload
    let isError = null;
    const result: any = await PublicModules.fun_saveFile(newFileName, file.buffer)
      .catch((e) => {
        isError = e;
      });
    // error ?
    if (isError) {
      task = PublicModules.fun_makeResError(isError, 'UPLOAD_ERROR_BY_USER');
      return task;
    }

    // file response
    const urlView = `${process.env.APP_HOST}:${process.env.PORT}/api/files/image/${result}`;
    task = PublicModules.fun_makeResCreateSucc(Object.assign({}, {
      fileName: result,
      urlView: urlView,
    }));

    return task;
  }

  async uploadImageToServerCkeditor(req: any, file: Express.Multer.File, fileName: string = null) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // file ?
    if (!file) {
      task = PublicModules.fun_makeResError(null, 'FILE_NULL');
      return task;
    }

    // rename > file
    const newFileName = fileName || PublicModules.fun_renameImage(file.originalname);

    // resize
    let bufferResized = file.buffer;
    // // const percentage = 25;
    // const metaWH = await sharp(file.buffer).metadata();
    // if (metaWH.width <= 100)
    //   bufferResized = file.buffer;
    // else {
    //   // const width = Math.round(metaWH.width * percentage / 100);
    //   // const height = Math.round(metaWH.height * percentage / 100);
    //   bufferResized = await sharp(file.buffer)
    //     .resize(400)
    //     .toFormat("jpeg")
    //     .jpeg({ quality: 90 })
    //     .toBuffer();
    // }

    // upload
    let isError = null;
    const result: any = await PublicModules.fun_saveFile(newFileName, bufferResized, '/uploads/images_ck/')
      .catch((e) => {
        isError = e;
      });
    // error ?
    if (isError) {
      task = PublicModules.fun_makeResError(isError, 'UPLOAD_ERROR_BY_USER');
      return task;
    }

    // file response
    const env = process.env.ENV;
    let urlView = '';
    if (String(env).toLowerCase() === 'prod')
      urlView = `${process.env.APP_HOST}/api/files/image_ck/${result}`;
    else
      urlView = `${process.env.APP_HOST}:${process.env.PORT}/api/files/image_ck/${result}`;
    return {
      uploaded: true,
      url: urlView,
    };
  }

  async uploadImageToIpfsAndServer(req: any, file: Express.Multer.File) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const handleUpladToIPFS = await this.uploadImageToIpfs(req, file);
    // error ?
    if (!handleUpladToIPFS.success) {
      task = PublicModules.fun_makeResError(handleUpladToIPFS.result, handleUpladToIPFS.message);
      return task;
    }

    const handleUploadToServer = await this.uploadImageToServer(file, handleUpladToIPFS.result.fileName);
    // error ?
    if (!handleUploadToServer.success) {
      task = PublicModules.fun_makeResError(handleUploadToServer.result, handleUploadToServer.message);
      return task;
    }

    // ok return fileName
    task = PublicModules.fun_makeResCreateSucc(Object.assign({}, {
      ipfs: handleUpladToIPFS.result,
      server: handleUploadToServer.result,
    }));

    return task;
  }

  private toSmoodText = (text: string): string => {
    let result = ''
    let countSpace = 0;
    let countEndLine = 0;
    for (let i = 0; i < text.length; i++) {
      const chr = text[i];
      if (
        chr === ':' ||
        chr === '-' ||
        chr === '.' ||
        chr === '"' ||
        chr === '\'' ||
        chr === '\/' ||
        chr === '\\' ||
        chr === '?' ||
        chr === '’' ||
        chr === ',' ||
        chr === '“' ||
        chr === '”' ||
        chr === '–'
      ) {
        result += chr;
        countSpace = 0;
        countEndLine = 0;
      } else if (PublicModules.fun_isDigit(chr)) {
        result += chr;
        countSpace = 0;
        countEndLine = 0;
      }
      else if (PublicModules.fun_isLetterVN(chr)) {
        result += chr.toLowerCase();
        countSpace = 0;
        countEndLine = 0;
      } else if (chr === '\n' && countEndLine === 0) {
        result += chr;
        countEndLine += 1;
      } else if (countSpace === 0) {
        result += ' ';
        countSpace += 1;
      }
    }

    return result;
  }

  private isValidSentence = (sentence: string) => {
    if (!sentence || sentence.length <= 1) return false;
    let countLetter = 0;
    for (let i = 0; i < sentence.length; i++) {
      if (PublicModules.fun_isLetterVN(sentence[i]))
        countLetter += 1;
    }
    return countLetter >= 1;
  };

  private toSmoodJson = (smoodText: string, filter = {
    Q: 'cau',
    A: ['a.', 'b.', 'c.', 'd.']
  }): any[] => {
    const result = [];
    const textArray = smoodText.split('\n');
    let sentence = '';
    let objQuestion = {
      Q: '',
      A: [],
    };
    filter.Q = PublicModules.fun_changeToSlug(filter.Q);
    let idxTmp = -2, idxCurrent = -2;
    for (let i = 0; i < textArray.length; i++) {
      sentence = textArray[i].trim();
      if (!this.isValidSentence(sentence)) continue;
      let toSlug = PublicModules.fun_changeToSlug(sentence.substring(0, filter.Q.length));
      if (toSlug.includes(filter.Q)) {
        objQuestion.Q = `${sentence}`;
        objQuestion.A = [];
        idxCurrent = -2;// current Q;
      } else {
        toSlug = sentence.substring(0, filter.A[0].length);
        idxTmp = filter.A.indexOf(toSlug);
        if (idxTmp !== -1) {
          idxCurrent = idxTmp;
          if (objQuestion.A.length < filter.A.length)
            objQuestion.A.push(sentence.substring(filter.A[0].length, sentence.length));
          if (idxTmp === filter.A.length - 1)
            result.push({ ...objQuestion });
        } else {
          // if (idxCurrent < 0) {
          //   if (objQuestion.Q.length < LEN_OF_FIELDS.LENGTH_HEIGHT)
          //     objQuestion.Q += `${sentence} `;
          //   else
          //     objQuestion.Q = sentence;
          // }
          // else {
          //   if (objQuestion.A[idxCurrent].length < LEN_OF_FIELDS.LENGTH_MEDIUM)
          //     objQuestion.A[idxCurrent] += `${sentence} `;
          //   else
          //     objQuestion.A[idxCurrent] = sentence;
          // }
          if (idxCurrent < 0) {
            objQuestion.Q += ` ${sentence}`;
          }
          else {
            objQuestion.A[idxCurrent] += ` ${sentence}`;
          }
        }
      }
    }

    return result;
  };

  // private toSmoodJson = (smoodText: string, filter = {
  //   Q: 'cau',
  //   A: ['a.', 'b.', 'c.', 'd.']
  // }): any[] => {
  //   const result = [];
  //   const textArray = smoodText.split('\n');
  //   let sentence = '';
  //   let objQuestion = {
  //     Q: '',
  //     A: [],
  //   };
  //   filter.Q = PublicModules.fun_changeToSlug(filter.Q);
  //   let idxTmp = -2, idxCurrent = -2;
  //   for (let i = 0; i < textArray.length; i++) {
  //     sentence = textArray[i].trim();
  //     if (!this.isValidSentence(sentence)) continue;
  //     let toSlug = PublicModules.fun_changeToSlug(sentence.substring(0, filter.Q.length));
  //     if (toSlug.includes(filter.Q)) {
  //       objQuestion.Q = `[${sentence}] `;
  //       objQuestion.A = [];
  //       idxCurrent = -2;// current Q;
  //     } else {
  //       toSlug = sentence.substring(0, filter.A[0].length);
  //       idxTmp = filter.A.indexOf(toSlug);
  //       if (idxTmp !== -1) {
  //         idxCurrent = idxTmp;
  //         if (objQuestion.A.length < filter.A.length)
  //           objQuestion.A.push(sentence.substring(filter.A[0].length, sentence.length));
  //         if (idxTmp === filter.A.length - 1)
  //           result.push({ ...objQuestion });
  //       } else {
  //         if (idxCurrent < 0) {
  //           if (objQuestion.Q.length < LEN_OF_FIELDS.LENGTH_HEIGHT)
  //             objQuestion.Q += `[${sentence}] `;
  //           else
  //             objQuestion.Q = sentence;
  //         }
  //         else {
  //           if (objQuestion.A[idxCurrent].length < LEN_OF_FIELDS.LENGTH_MEDIUM)
  //             objQuestion.A[idxCurrent] += `[${sentence}] `;
  //           else
  //             objQuestion.A[idxCurrent] = sentence;
  //         }
  //       }
  //     }
  //   }

  //   return result;
  // };

  async pdf2Text(req: any, fileName: string, outData = { outText: '' }) {
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const fs = require('fs');
    const pdf = require('pdf-parse');

    let task: TaskRes = null;
    // check file
    if (!fileName || fileName.length <= 4) {
      task = PublicModules.fun_makeResError(null, Dics.BAD_REQUEST);
      return task;
    }
    const path = join(process.cwd(), `/uploads/images/${fileName}`);
    const ext = fileName.substring(fileName.length - 4, fileName.length);
    if (ext.toLowerCase() !== '.pdf' || !fs.existsSync(path)) {
      task = PublicModules.fun_makeResError(null, Dics.BAD_REQUEST);
      return task;
    }

    let dataBuffer = fs.readFileSync(path);
    let err = null;
    const toText = await pdf(dataBuffer).catch((_e: any) => {
      err = _e;
      console.log("🚀 ~ file: files.service.ts ~ line 168 ~ FilesService ~ pdf2Text ~ _e", _e)
    });
    if (!toText) {
      task = PublicModules.fun_makeResError(err, Dics.BAD_REQUEST);
      return task;
    }
    toText.text = this.toSmoodText(toText.text);
    outData.outText = toText.text;
    const result = Object.assign({}, {
      pageNumber: toText.numpages,
      info: toText.info,
      metadata: toText.metadata,
      version: toText.version,
      text: toText.text.length > 5000 ? toText.text.substring(0, 5000) : toText.text,
    });

    task = PublicModules.fun_makeResCreateSucc(result);

    return task;
  }

  async text2Json(req: any, fileName: string, dto: TextToJsonDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // bad request ?
    const outData = { outText: '' };
    const text = await this.pdf2Text(req, fileName, outData);
    if (!text.success) {
      task = PublicModules.fun_makeResError(null, Dics.BAD_REQUEST);
      return task;
    }
    if (!text.result.text || text.result.text.length < LEN_OF_FIELDS.LENGTH_LOW) {
      task = PublicModules.fun_makeResError(null, Dics.BAD_REQUEST);
      return task;
    }
    const result = this.toSmoodJson(outData.outText, {
      Q: dto.qFind,
      A: dto.aFinds,
    });
    task = PublicModules.fun_makeResListSucc(result.length > 50 ? result.slice(0, 50) : result, result.length, null);

    return task;
  }

  async deleteFile(req: any, fileName: string) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const reuslt = PublicModules.fun_removeFileIfExists(fileName);
    task = PublicModules.fun_makeResDeleteSucc(reuslt);

    return task;
  }

  async insertQA(req: any, postId: number, fileName: string, dto: TextToJsonDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // check postId
    const post = await this.postService.findById(postId);
    if (!post) {
      task = PublicModules.fun_makeResNotFound(null, 'POST');
      return task;
    }
    // bad request ?
    const outData = { outText: '' };
    const text = await this.pdf2Text(req, fileName, outData);
    if (!text.success) {
      task = PublicModules.fun_makeResError(null, Dics.BAD_REQUEST);
      return task;
    }
    if (!text.result.text || text.result.text.length < LEN_OF_FIELDS.LENGTH_LOW) {
      task = PublicModules.fun_makeResError(null, Dics.BAD_REQUEST);
      return task;
    }
    const result = this.toSmoodJson(outData.outText, {
      Q: dto.qFind,
      A: dto.aFinds,
    });
    // save on db
    let qaTmp: QuestionAnswer = null;
    post.own = PublicModules.fun_secureUser(post.own);
    const newQAs = result.map((v, index) => {
      qaTmp = this.qAsService.create();
      qaTmp.q = v.Q;
      qaTmp.a = this.buildAnswer(v.A);
      qaTmp.post = post;
      qaTmp.orderIndex = index;
      return Object.assign({}, { ...qaTmp });
    });
    const isSave = await this.qAsService.save(newQAs);
    task = PublicModules.fun_makeResCreateSucc(isSave);
    PublicModules.fun_removeFileIfExists(fileName);

    return task;
  }

  private buildAnswer(array: []) {
    let result = '';
    for (let i = 0; i < array.length; i++) {
      result += array[i];
      if (i !== array.length - 1)
        result += ';vsl;';
    }
    return result;
  }
}
