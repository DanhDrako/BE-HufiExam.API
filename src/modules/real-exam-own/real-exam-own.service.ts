import { Injectable } from '@nestjs/common';
import { TaskRes } from 'src/common/Classess';
import { PublicModules } from 'src/common/PublicModules';
import { RealExamOwn } from 'src/entities/real-exam-own.entity';
import { Connection, IsNull, Repository } from 'typeorm';
import { PostService } from '../post/post.service';
import { CreateRealExamOwnDto } from './dto/create-real-exam-own.dto';
import { UpdateRealExamOwnDto } from './dto/update-real-exam-own.dto';

@Injectable()
export class RealExamOwnService {
  private realExamRepo: Repository<RealExamOwn> = null;

  constructor(
    private readonly connection: Connection,
    private readonly postRepo: PostService,
  ) {
    this.realExamRepo = this.connection.getRepository(RealExamOwn);
  }
  getRepo () {
    return this.realExamRepo;
  }


  async create(req: any, createRealExamOwnDto: CreateRealExamOwnDto) {
    let task: TaskRes = null;
    const user = req.user;

    //Check post id
    let find = await this.postRepo
      .getRepo()
      .findOne({
        where: { id: createRealExamOwnDto.postId, isRealTest: true },
      });
    if (!find) {
      task = PublicModules.fun_makeResNotFound(find);
      return task;
    }

    //Check email
    let findE = await this.realExamRepo.findOne({
      where: { email: createRealExamOwnDto.email, post: find },
    });
    if (findE) {
      task = PublicModules.fun_makeResError(null, findE);
      return task;
    }

    const newExamRe = this.realExamRepo.create();
    newExamRe.email = createRealExamOwnDto.email;
    newExamRe.post = find;
    newExamRe.ownId = user;

    //save
    const result = await this.realExamRepo.save(newExamRe);
    result.ownId = PublicModules.fun_secureUser(result.ownId);
    task = PublicModules.fun_makeResCreateSucc(result);

    return task;
  }

  async CheckUserExam(req: any, id: number) {
    let task: TaskRes = null;
    const user = req.user;
    //find post real
    let find = await this.postRepo
      .getRepo()
      .findOne({ where: { id, isRealTest: true } });
    if (!find) {
      task = PublicModules.fun_makeResNotFound(find);
      return task;
    }

    let qb = await this.realExamRepo.findOne({where:{post:find,email:user.email,ttexam: false}});
  
    if (!qb) {
      task = PublicModules.fun_makeResNotFound(qb);
      return task;
    }

    task = PublicModules.fun_makeResFoundSucc(qb);
    return task;
  }

  async findOne(id: number) {
    let task: TaskRes = null;

    //find post real
    let find = await this.postRepo
      .getRepo()
      .findOne({ where: { id, isRealTest: true } });
    if (!find) {
      task = PublicModules.fun_makeResNotFound(find);
      return task;
    }

    const result = await this.realExamRepo.find({ where: { post:find } });
    task = PublicModules.fun_makeResListSucc(result);
    return task;
  }

  update(id: number, updateRealExamOwnDto: UpdateRealExamOwnDto) {
    return `This action updates a #${id} realExamOwn`;
  }

  async remove(id: number) {
    let task: TaskRes = null;

    let find = await this.realExamRepo.findOne({ where: { id } });
    if (!find) {
      task = PublicModules.fun_makeResNotFound(find);
      return task;
    }

    const result = this.realExamRepo.softRemove(find);
    task = PublicModules.fun_makeResDeleteSucc(result);
    return task;
  }
}
