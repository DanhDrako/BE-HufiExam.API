import { Injectable } from '@nestjs/common';
import { TaskRes } from 'src/common/Classess';
import { PublicModules } from 'src/common/PublicModules';
import { Post } from 'src/entities/post.entity';
import { QuestionAnswer } from 'src/entities/question-answer.entity';
import { Connection, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { PostService } from '../post/post.service';
import { CreateQuestionAnswerDto } from './dto/create-question-answer.dto';
import { FilterQuestion } from './dto/filter-question.dto';
import { FilterQueryBasicDto } from './dto/FilterQueryBasicDto';
import { UpdateQuestionAnswerDto } from './dto/update-question-answer.dto';

@Injectable()
export class QuestionAnswerService {
  private qAsRepo: Repository<QuestionAnswer> = null;
  private postRepo: Repository<Post> = null;

  constructor(
    private readonly connection: Connection,
    private readonly authService: AuthService,
  ) {
    this.qAsRepo = this.connection.getRepository(QuestionAnswer);
    this.postRepo = this.connection.getRepository(Post);
  }

  public async countQuestion(postId: number) {
    return await this.qAsRepo.count({ where: { post: postId } });
  }

  async gets(req: any, postId: number, filter: FilterQuestion) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const skip = filter.skip || 0;
    const page = filter.page || 1;
    const limit = filter.limit || 10;

    // basic query
    let qb = this.qAsRepo.createQueryBuilder('qa')
      .innerJoin('qa.post', 'post')
      .where('post.id = :id', { id: postId });

    // is qa
    if (filter.isQa && String(filter.isQa) === 'true')
      qb = qb.andWhere('qa.qa IS NOT NULL');
    else
      qb = qb.andWhere('qa.qa IS NULL');

    // total get
    const total = await qb.getCount();

    let finds: QuestionAnswer[] = [];

    // is random ?
    if (filter.isRandom && String(filter.isRandom) === 'true') {
      qb = qb.orderBy('RANDOM()');
      // page & limit
      finds = await qb.offset(skip).limit(limit).getMany();
    }
    else {
      qb = qb.orderBy('qa.orderIndex', 'ASC');
      // page & limit
      finds = await qb.skip((page - 1) * limit).take(limit).getMany();
    }

    // result
    task = PublicModules.fun_makeResListSucc(finds.map((v) => {
      if (v.post) v.post.own = PublicModules.fun_secureUser(v.post.own);
      return Object.assign({}, {
        id: v.id,
        q: v.q,
        a: v.a.split(';vsl;'),
        qa: v.qa,
      });
    }), total, null);

    return task;
  }

  async puts(req: any, _postId: number, dto: UpdateQuestionAnswerDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const newQas: QuestionAnswer[] = [];
    let qaTmp: QuestionAnswer = null;
    dto.body.forEach(e => {
      qaTmp = this.qAsRepo.create();
      qaTmp = this.qAsRepo.merge(qaTmp, e);
      newQas.push({ ...qaTmp });
    });

    await this.qAsRepo.save(newQas);
    task = PublicModules.fun_makeResUpdateSucc('result');

    return task;
  }

  async getExamTest(query: FilterQueryBasicDto) {
    const limit = query.limit || 10;
    const skip = ((query.page || 1) - 1) * limit;

    let total: any = await this.connection.query( `select count(DISTINCT p."id") as "total"
    from "post" p, "question_answer" qa
    where p."id" = qa."postId" and p."deleteAt" IS NULL`);

    const result: any[] = await this.connection.query(
      `select p."id", p."title", p."description", p."imageBanner", p."imageUploadType", p."updateAt", p."isRealTest", count(p."id") as "numQ"
      from "post" p, "question_answer" qa
      where p."id" = qa."postId" and p."deleteAt" IS NULL
      group by p."id"
      offset ${skip}
      limit ${limit}`
    );
    
    if(total && total.length && total[0].total) {
      total = Number(total[0].total);
    } else {
      total = 0;
    }
    
    return PublicModules.fun_makeResListSucc(result,total);
  }

  async insertQa(dto: CreateQuestionAnswerDto) {
    let task: TaskRes = null;
    const post = await this.postRepo.findOne({ where: { id: dto.postId } });
    if (!post) {
      task = PublicModules.fun_makeResError(null, 'Post not found!');
      return task;
    }

    // order index
    var orderIndex = await this.connection.query(
      `SELECT MAX("orderIndex") as "max"
      FROM "question_answer"
      WHERE "postId" = ${dto.postId}`
    );
    orderIndex = orderIndex[0].max || 0;

    const newQa = this.qAsRepo.create();
    newQa.post = post;
    newQa.q = dto.q;
    newQa.a = dto.a;
    newQa.qa = dto.qa;
    newQa.orderIndex = orderIndex + 1;
    const result = await this.qAsRepo.save(newQa);
    task = PublicModules.fun_makeResCreateSucc(result);

    return task;
  }

  async DeleteQa(id: number) {
    let task: TaskRes = null;
    const find = await this.qAsRepo.findOne({ where: { id: id } });
    if (!find) {
      task = PublicModules.fun_makeResNotFound('null', 'Question');
      return task;
    }
    const result = await this.qAsRepo.remove(find);
    task = PublicModules.fun_makeResDeleteSucc(result);

    return task;
  }
}
