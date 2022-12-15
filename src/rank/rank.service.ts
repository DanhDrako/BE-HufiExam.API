import { RealExamOwnService } from './../modules/real-exam-own/real-exam-own.service';
import { Injectable } from '@nestjs/common';
import { TaskRes } from 'src/common/Classess';
import { PublicModules } from 'src/common/PublicModules';
import { Rank } from 'src/entities/rank.entity';
import { AuthService } from 'src/modules/auth/auth.service';
import { PostService } from 'src/modules/post/post.service';
// import { UserService } from 'src/modules/user/user.service';
import { Connection, Repository } from 'typeorm';
import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';
import * as Dics from 'src/common/MyDictionary.json';
import { RankFilter } from './dto/rankFilter.dto';
import { User } from 'src/entities/user.entity';

@Injectable()
export class RankService {
  private rankRepo: Repository<Rank> = null;
  constructor(
    private readonly connection: Connection,
    private readonly authService: AuthService,
    // private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly realExamOwnService: RealExamOwnService,
  ) {
    this.rankRepo = this.connection.getRepository(Rank);
  }
  async create(req: any, dto: CreateRankDto) {
    const isAuthClient = this.authService.checkAuthFromClientV2(dto);
    if (!isAuthClient.success) return isAuthClient;
    let task: TaskRes = null;
    const user = req.user;
    const post = await this.postService.findById(dto.postId);
    if (!post) {
      task = PublicModules.fun_makeResError(null, 'Post ' + Dics.NOT_FOUND);
      return task;
    }
    // find lastest
    let rankLasted = await this.rankRepo.findOne({
      where: { post: dto.postId, user: user.id },
    });

    // update ttExamReal:
    // + checkRealExam
    let findRealExam = await this.postService.getRepo().findOne({ where: { id: dto.postId, isRealTest: true } });
    if (findRealExam) {
      let qb = await this.realExamOwnService.getRepo().findOne({
        where: { post: findRealExam, email: user.email, ttexam: false },
      });
      if(!qb) {
        task = PublicModules.fun_makeResNotFound(qb);
        return task;
      }
      qb.ttexam = true;
      const result = this.realExamOwnService.getRepo().save(qb);
      task = PublicModules.fun_makeResUpdateSucc(result);
      if (rankLasted) return task;
    }

    // create
    if (!rankLasted) {
      rankLasted = this.rankRepo.create();
      rankLasted.user = user;
      rankLasted.post = post;
      rankLasted.point = dto.point;
      rankLasted.tryNumber = 1;
      const result = await this.rankRepo.save(rankLasted);
      result.user = PublicModules.fun_secureUser(result.user);
      task = PublicModules.fun_makeResCreateSucc(result);
      return task;
    }
    

    // update
    rankLasted.tryNumber += 1;
    rankLasted.point = dto.point;
    const result = await this.rankRepo.save(rankLasted);
    result.user = PublicModules.fun_secureUser(result.user);
    task = PublicModules.fun_makeResCreateSucc(result);
    return task;
  }

  async findAll(user: User, filter: RankFilter) {
    let task: TaskRes = null;
    const limit = filter.limit || 10;
    const page = ((filter.page || 1) - 1) * limit;
    const limitUsers = filter.limitUsers || 20;
    const pageUsers = ((filter.pageUsers || 1) - 1) * limitUsers;

    let postFinds: any[] = null;
    if (user && user.role === 'ADMIN') {
        postFinds = await this.connection.query(
          `select p."id", p."title", p."isShowRank", count(*) as "count"
          from "rank" r, "post" p
          where r."postId" = p."id" 
          group by p."id", p."title" 
          offset ${page}
          limit ${limit}`,
        );
    } else {
      postFinds = await this.connection.query(
        `select p."id", p."title", count(*) as "count"
        from "rank" r, "post" p
        where r."postId" = p."id" and p."isShowRank" = true
        group by p."id", p."title"
        offset ${page}
        limit ${limit}`,
      );
    }

    const total: any[] = await this.connection.query(
      `select count(distinct "rank"."postId")
      from "rank"`,
    );

    const result: any[] = [];
    let tmp = null;
    for (let i = 0; i < postFinds.length; i++) {
      const postI = postFinds[i];
      const usersFinds = await this.rankRepo
        .createQueryBuilder('rank')
        .innerJoinAndSelect('rank.post', 'post')
        .innerJoinAndSelect('rank.user', 'user')
        .where('post.id = :postId', { postId: postI.id })
        .orderBy('rank.point', 'DESC')
        .addOrderBy('rank.tryNumber', 'DESC')
        .addOrderBy('rank.updateAt', 'DESC')
        .skip(pageUsers)
        .take(limitUsers)
        .getMany();
      const users = usersFinds.map(v => {
        v.user = PublicModules.fun_secureUser(v.user);
        v.post = null;
        return v;
      });
      tmp = Object.assign(
        {},
        {
          post: postI,
          users: users,
        },
      );
      result.push(tmp);
    }
    result.sort(this.compare);
    task = PublicModules.fun_makeResListSucc(result, total[0].count);

    return task;
  }

  compare = (a: any, b: any) => {
    if (a.post.count < b.post.count) {
      return 1;
    }
    if (a.post.count > b.post.count) {
      return -1;
    }
    return 0;
  };

  async findOne(id: number) {
    let task: TaskRes = null;
    const postFinds: any[] = await this.connection.query(
      `select p."id", p."title", count(*) as "count"
      from "rank" r, "post" p
      where r."postId" = p."id" and p."id"=${id}
      group by p."id", p."title"`,
    );

    const result: any[] = [];
    let tmp = null;
    for (let i = 0; i < postFinds.length; i++) {
      const postI = postFinds[i];
      const usersFinds = await this.rankRepo
        .createQueryBuilder('rank')
        .innerJoinAndSelect('rank.post', 'post')
        .innerJoinAndSelect('rank.user', 'user')
        .where('post.id = :postId', { postId: postI.id })
        .orderBy('rank.point', 'DESC')
        .addOrderBy('rank.tryNumber', 'DESC')
        .addOrderBy('rank.updateAt', 'DESC')
        .skip(0)
        .take(20)
        .getMany();
      const users = usersFinds.map(v => {
        v.user = PublicModules.fun_secureUser(v.user);
        v.post = null;
        return v;
      });
      tmp = Object.assign(
        {},
        {
          post: postI,
          users: users,
        },
      );
      result.push(tmp);
    }

    task = PublicModules.fun_makeResListSucc(result);

    return task;
  }

  update(id: number, updateRankDto: UpdateRankDto) {
    return `This action updates a #${id} rank`;
  }

  remove(id: number) {
    return `This action removes a #${id} rank`;
  }
}
