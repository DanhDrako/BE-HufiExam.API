import { forwardRef, Inject, Injectable, Req } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { TaskRes } from 'src/common/Classess';
import { PublicModules } from 'src/common/PublicModules';
import { Post } from 'src/entities/post.entity';
import { Connection, Repository, SelectQueryBuilder } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import * as Dics from 'src/common/MyDictionary.json';
import { CategoryService } from '../category/category.service';
import { TagNameService } from '../tag-name/tag-name.service';
import { FilterQueryString as PostFilter } from './dto/FilterQueryString';
import { REACT_TYPE, RolerUser } from 'src/common/Enums';
import { UserReactService } from '../user-react/user-react.service';
import { CommentReactService } from '../comment-react/comment-react.service';
import { QuestionAnswerService } from '../question-answer/question-answer.service';
import { AuthService } from '../auth/auth.service';
import { ClickAds } from 'src/entities/click-ads.entity';
import { UpdateRealTestDto } from './dto/update-real-test.dto';

@Injectable()
export class PostService {
  private postRepo: Repository<Post> = null;
  private clickAdsRepo: Repository<ClickAds> = null;

  constructor(
    private readonly connection: Connection,
    private readonly cateService: CategoryService,
    private readonly tagService: TagNameService,
    @Inject(forwardRef(() => UserReactService))
    private readonly urService: UserReactService,
    private readonly cReactService: CommentReactService,
    private readonly qAsService: QuestionAnswerService,
    private readonly authService: AuthService,
  ) {
    this.postRepo = this.connection.getRepository(Post);
    this.clickAdsRepo = this.connection.getRepository(ClickAds)
  }

  getRepo() {
    return this.postRepo;
  }

  async findByTitle(title: string) {
    return await this.postRepo.createQueryBuilder('post')
      .where('LOWER(post.title) = LOWER(:title)', { title: title }).getOne();
  }

  async findById(id: number) {
    return await this.postRepo.findOne({ where: { id: id } });
  }

  async create(req: any, dto: CreatePostDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const user = req.user;
    let isAdmin = false;
    if (user.role === RolerUser.ADMIN || user.role === RolerUser.MOD)
      isAdmin = true;
    const find = await this.findByTitle(dto.title);
    if (find) {
      if (dto.imageBanner && dto.imageBanner !== find.imageBanner) PublicModules.fun_removeFileIfExists(dto.imageBanner);
      task = PublicModules.fun_makeResError(null, Dics.TITLE_FOUND);
      return task;
    }

    // check category
    let cate = await this.cateService.findById(dto.category || 1);
    if (!cate)
      cate = await this.cateService.findById(1);// default

    // new instance
    const newPost = plainToClass(Post, { ...dto, cate: cate, tags: [], title: dto.title.trim(), });
    newPost.slug = PublicModules.fun_changeToSlug(newPost.title);
    newPost.own = user;
    newPost.commited = isAdmin;
    //newPost.commited = true;

    // tags ?
    if (dto.tags) {
      for (let i = 0; i < dto.tags.length; i++) {
        let tagFind = null;
        try {
          tagFind = await this.tagService.findById(Number.parseInt(dto.tags[i]));
        } catch (e) {
          // do something
        }
        if (!tagFind) continue;
        newPost.tags.push(tagFind);
      }
    }

    // save
    const result = await this.postRepo.save(newPost);
    result.own = PublicModules.fun_secureUser(result.own);
    task = PublicModules.fun_makeResCreateSucc(result);

    return task;
  }

  async findOne(req: any, id: number) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const find = await this.postRepo.createQueryBuilder('post')
      .innerJoinAndSelect('post.cate', 'category')
      .innerJoinAndSelect('post.own', 'user')
      .leftJoinAndSelect('post.tags', 'tagname')
      .where('post.id = :id', { id: id })
      .getOne();
    if (!find) {
      task = PublicModules.fun_makeResNotFound(null, 'POST');
      return task;
    }
    find.own = PublicModules.fun_secureUser(find.own);
    const countQuestion = await this.qAsService.countQuestion(find.id);
    task = PublicModules.fun_makeResFoundSucc(
      {
        ...find, images: find.images ? find.images.split(';vsl;') : [],
        countQuestion: countQuestion,
      }
    );

    return task;
  }

  async updateShowRank(req: any, id: number, dto: UpdatePostDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // exists ?
    let find = await this.findById(id);
    if (!find) {
      task = PublicModules.fun_makeResNotFound(find);
      return;
    }
    //Update show rank
    find.isShowRank = dto.isShowRank;
    const result = this.postRepo.save(find);
    task = PublicModules.fun_makeResUpdateSucc(result);
    return task;
  }

  async update(req: any, id: number, dto: UpdatePostDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // exists ?
    let find = await this.findById(id);
    if (!find) {
      task = PublicModules.fun_makeResNotFound(find);
      return;
    }

    // update
    // check category
    let cate = await this.cateService.findById(dto.category || 1);
    if (!cate)
      cate = await this.cateService.findById(1);// default

    // delete image old
    if (dto.imageBanner
      && dto.imageBanner !== find.imageBanner
      && find.imageBanner !== cate.imageBanner
    ) PublicModules.fun_removeFileIfExists(find.imageBanner);
    // ismarket place remove imgage ?
    let newImages: string[] = [];
    const newStrs = dto.images || '';
    newImages = newStrs.split(';vsl;');
    let oldImages: string[] = [];
    const oldStrs = find.images || '';
    oldImages = oldStrs.split(';vsl;');
    oldImages.forEach(old => {
      if (!newImages.find((v) => v === old))
        PublicModules.fun_removeFileIfExists(old);
    });


    // new instance
    find = this.postRepo.merge(find, { ...dto, cate: cate, tags: [], slug: PublicModules.fun_changeToSlug(dto.title) });

    // tags ?
    if (dto.tags) {
      for (let i = 0; i < dto.tags.length; i++) {
        let tagFind = null;
        try {
          tagFind = await this.tagService.findById(Number.parseInt(dto.tags[i]));
        } catch (_e) {
          // do something
        }
        if (!tagFind) continue;
        find.tags.push(tagFind);
      }
    }

    // save
    const result = await this.postRepo.save(find);
    result.own = PublicModules.fun_secureUser(result.own);
    task = PublicModules.fun_makeResUpdateSucc(result);

    return task;
  }

  async remove(req: any, id: number) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // exsts ?
    const find = await this.findById(id);
    if (!find) {
      task = PublicModules.fun_makeResNotFound(null, 'POST');
      return task;
    }

    // remove banner ?
    const cate = await this.cateService.getRepo().createQueryBuilder('cate')
      .innerJoin('cate.posts', 'post')
      .where('post.id = :id', { id: id })
      .getOne();
    if (cate && find.imageBanner !== cate.imageBanner)
      PublicModules.fun_removeFileIfExists(find.imageBanner);

    // ismarket place remove imgage ?
    let images: string[] = [];
    const strs = find.images || '';
    images = strs.split(';vsl;');
    images.forEach(e => {
      PublicModules.fun_removeFileIfExists(e);
    });
    const result = await this.postRepo.softRemove(find);
    result.own = PublicModules.fun_secureUser(result.own);
    task = PublicModules.fun_makeResDeleteSucc(result);

    return task;
  }

  async filterV2(req: any, query: PostFilter) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // defalut value
    // cate = 0 load all cate | cate = -1 isBlackMarket.
    const cate = query.cate || 0;
    const page = query.page || 1;
    const limit = query.limit || 10;
    const keyWord = query.keyWord || null;
    const tags = query.tags || null;
    const qrRort = query.sort || 0;

    // 0st get many -> basic
    let qb: SelectQueryBuilder<Post> = null;
    qb = this.postRepo.createQueryBuilder('post')
      .innerJoinAndSelect('post.own', 'user')
      .innerJoinAndSelect('post.cate', 'category')
      .leftJoinAndSelect('post.tags', 'tagname')
      .where('post.commited = true')

    // 1st sort ?
    qb = qb.orderBy(
      'post.updateAt',
      qrRort == 0 ? 'DESC' : 'ASC'
    );

    // 2st cate ?
    if (cate == -1)
      qb = qb.andWhere('post.isBlackMarket = true');
    else if (cate == 0)
      qb = qb.andWhere('post.isBlackMarket = false');
    else
      qb.andWhere('category.id = :id', { id: cate });

    // 3st keyWord ?
    if (keyWord)
      qb = qb.andWhere('post.slug like :keyWord', { keyWord: '%' + PublicModules.fun_changeToSlug(keyWord.trim()) + '%' });

    // 4tags ?
    if (tags) {
      try {
        if (typeof tags === 'string' || typeof tags === 'number') {
          qb = qb.andWhere('tagname.id IN (:tags)', { tags: Number.parseInt(tags) });
        } else {
          qb = qb.andWhere('tagname.id IN (:...tags)', { tags: tags });
        }
      } catch (_e) {
        // do no thing
      }
    }

    // 5st get total
    const total = await qb.getCount();

    // 6st paging
    qb = qb
      .skip((page - 1) * limit)
      .take(limit);

    // 7finish
    const data = await qb.getMany();

    // 8st optimize memory
    let countExam = 0;
    let countLike = 0;
    let countComment = 0;
    let countQuestion = 0;
    let isExam = false;
    let isLike = false;
    let isComment = false;
    let taskCount: TaskRes = null;
    let result = [];
    for (let i = 0; i < data.length; i++) {
      const v = data[i];
      taskCount = await this.urService.countExam(v.id);
      if (taskCount.success) countExam = taskCount.result;
      taskCount = await this.urService.countLike(v.id);
      if (taskCount.success) countLike = taskCount.result;
      countQuestion = await this.qAsService.countQuestion(v.id);
      if (query.userId) {
        isExam = await this.urService.isReact(query.userId, v.id, REACT_TYPE.EXAM_COMMIT);
        isLike = await this.urService.isReact(query.userId, v.id, REACT_TYPE.USER_LIKE);
      }
      isComment = await this.cReactService.isUserCommented(query.userId, v.id);
      countComment = await this.cReactService.countComment(v.id);
      v.own = PublicModules.fun_secureUser(v.own);
      const map = {
        ...v,
        tags: v.tags.map((v) => v.name),
        images: v.images ? v.images.split(';vsl;') : [],
        content: '',
        countExam: countExam,
        countLike: countLike,
        isExam: isExam,
        isLike: isLike,
        isComment: isComment,
        countComment: countComment,
        countQuestion: countQuestion,
      }
      result.push(map);
    }

    if (query.start && String(query.start) === 'true')
      result.sort((a, b) => a.countExam < b.countExam ? 1 : -1);
    else if (query.heart && String(query.heart) === 'true')
      result.sort((a, b) => a.countLike < b.countLike ? 1 : -1);

    task = PublicModules.fun_makeResListSucc(result, total);
    return task;
  }

  async managePost(req: any, query: PostFilter) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const user = req.user;
    // defalut value
    const cate = query.cate || 0;
    const page = query.page || 1;
    const limit = query.limit || 10;
    const keyWord = query.keyWord || null;
    const tags = query.tags || null;
    const isBlackMarket = query.isBlackMarket || false;

    let isAndWhere = false;

    // 0st get many -> basic
    let qb: SelectQueryBuilder<Post> = null;
    qb = this.postRepo.createQueryBuilder('post')
      .innerJoinAndSelect('post.cate', 'category')
      .leftJoinAndSelect('post.tags', 'tagname')
      .innerJoinAndSelect('post.own', 'user')
      .orderBy('post.updateAt', 'DESC')
      .where('post.isBlackMarket = :isBlackMarket', { isBlackMarket })

    // 0st unCommited ?
    if (query.unCommited && String(query.unCommited) === 'true')
      qb = qb.andWhere('post.commited = false')

    // 1st user ?
    if (user.role !== RolerUser.ADMIN) {
      qb = qb.andWhere('user.id = :id', { id: user.id })
      isAndWhere = true;
    }

    // 2st cate ?
    if (cate > 0 && !isAndWhere)
      qb = qb.andWhere('category.id = :cateId', { cateId: cate })
    if (cate > 0 && isAndWhere)
      qb = qb.andWhere('category.id = :cateId', { cateId: cate })

    // 3st keyWord ?
    if (keyWord)
      qb = qb.andWhere('LOWER(post.slug) like :keyWord', { keyWord: '%' + PublicModules.fun_changeToSlug(keyWord.trim()).toLowerCase() + '%' });

    // 4tags ?
    if (tags) {
      try {
        if (typeof tags === 'string' || typeof tags === 'number') {
          qb = qb.andWhere('tagname.id = :id', { id: Number.parseInt(tags) });
        } else {
          tags.forEach(t => {
            qb = qb.andWhere('tagname.id = :id', { id: t });
          });
        }
      } catch (_e) {
        // do no thing
      }
    }

    // 5st get total
    const total = await qb.getCount();

    // 6st paging
    qb = qb
      .skip((page - 1) * limit)
      .take(limit);

    // 7finish
    const data = await qb.getMany();
    // 8st optimize memory
    const result = data.map((v) => {
      v.own = PublicModules.fun_secureUser(v.own);
      return {
        ...v,
        cate: v.cate.name,
        tags: v.tags.map((v) => v.name),
        images: v.images ? v.images.split(';vsl;') : [],
        description: null,
        content: null,
        own: null,
      }
    });

    task = PublicModules.fun_makeResListSucc(result, total);
    return task;
  }

  async commit(req: any, id: number) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // find post by id;
    const find = await this.findById(id);
    if (!find) {
      task = PublicModules.fun_makeResNotFound(null, 'POST');
      return task;
    }
    find.commited = true;
    const result = await this.postRepo.save(find);
    result.own = PublicModules.fun_secureUser(result.own);
    task = PublicModules.fun_makeResUpdateSucc(result);

    return task;
  }

  async isVslOne(req: any) {
    let task: TaskRes = null;
    const user = req.user;
    const find = await this.clickAdsRepo.createQueryBuilder('ClickAds')
      .select('MAX("clickAt") as "clickAt"')
      .where('"userId" = :userId', { userId: user.id })
      .getRawOne();

    const max = find.clickAt || 0;
    const currentUTC = PublicModules.fun_getCurrentTimestampUTC_Moment();
    const perClickAds = Number(process.env.PER_CLICK_ADS) || 84600;
    const isVslOne = currentUTC - max > perClickAds ? true : false;
    task = PublicModules.fun_makeResFoundSucc(isVslOne);

    return task;
  }

  async setVslOne(req: any) {
    let task: TaskRes = null;
    const user = req.user;
    const newClickAds = this.clickAdsRepo.create();
    newClickAds.user = user;
    newClickAds.clickAt = PublicModules.fun_getCurrentTimestampUTC_Moment();
    newClickAds.clickAtViewUTC = PublicModules.fun_getCurrentTimestampUTC_MomentViewUTC();
    const result = await this.clickAdsRepo.save(newClickAds);
    task = PublicModules.fun_makeResCreateSucc(result);

    return task;
  }

  async updateRealTest(req: any, postId: number, dto: UpdateRealTestDto) {
    let task: TaskRes = null;
    const user = req.user;
    if (user.role !== 'ADMIN'){
      task = PublicModules.fun_makeResError(null, 'Bạn không có quyền với thao tác này!');
      return task;
    }
    const postFind = await this.postRepo.findOne({where: {id: postId}});
    if (!postFind){
      task = PublicModules.fun_makeResError(null, 'Không tìm thấy bài viết có id: ' + postId);
      return task;
    }
    postFind.isRealTest = dto.isRealTest;
    postFind.realTestTime = dto.realTestTime;
    postFind.realTestRandom = dto.realTestRandom;
    const result = await this.postRepo.save(postFind);
    task = PublicModules.fun_makeResUpdateSucc(result);

    return task;
  }
}
