import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { TaskRes } from 'src/common/Classess';
import { COMMENT_REACT_TYPE, LEN_OF_FIELDS } from 'src/common/Enums';
import { PublicModules } from 'src/common/PublicModules';
import { Comment } from 'src/entities/comment.entity';
import { Connection, Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import * as Dics from 'src/common/MyDictionary.json';
import { PostService } from '../post/post.service';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentReactService } from '../comment-react/comment-react.service';
import { FilterCommentQuery } from './dto/FilterQueryComment.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class CommentService {
  private commentRepo: Repository<Comment> = null;

  constructor(
    private readonly connection: Connection,
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
    @Inject(forwardRef(() => CommentReactService))
    private readonly cReactService: CommentReactService,
    private readonly authService: AuthService,
  ) {
    this.commentRepo = this.connection.getRepository(Comment);
  }

  getRepo() {
    return this.commentRepo;
  }

  async findById(id: number) {
    return await this.commentRepo.findOne({ where: { id: id } });
  }

  async create(req: any, dto: CreateCommentDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    // check length of content.
    if (dto.content.length > LEN_OF_FIELDS.LENGTH_MEDIUM) {
      task = PublicModules.fun_makeResError('< 250 CHAR', Dics.LEN_TOO_LONG);
      return task;
    }
    // check post id
    const post = await this.postService.findById(dto.postId);
    if (!post) {
      task = PublicModules.fun_makeResNotFound(null, 'POST_ID');
      return task;
    }
    const newComment = this.commentRepo.create();
    newComment.content = dto.content;
    newComment.user = req.user;
    newComment.post = post;
    const result = await this.commentRepo.save(newComment);
    result.user = PublicModules.fun_secureUser(result.user);
    task = PublicModules.fun_makeResCreateSucc(result);

    return task;
  }

  async gets(req: any, postId: number, param: FilterCommentQuery) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const page = param.page || 1;
    const limit = param.limit || 10;
    let qb = this.commentRepo.createQueryBuilder('comment')
      .innerJoinAndSelect('comment.user', 'user')
      .innerJoin('comment.post', 'post')
      .where('post.id = :id', { id: postId })
      .orderBy('comment.createAt', 'DESC');
    const total = await qb.getCount();
    const find = await qb.skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const result = [];
    let tmp = null, v = null, status: COMMENT_REACT_TYPE = null, countLike = 0, countDislike = 0;
    for (let i = 0; i < find.length; i++) {
      v = find[i];
      status = await this.cReactService.getCommentStatus(param.userId, v.id);
      countLike = await this.cReactService.countReact(v.id, COMMENT_REACT_TYPE.LIKE);
      countDislike = await this.cReactService.countReact(v.id, COMMENT_REACT_TYPE.DISLIKE);
      tmp = {
        id: v.id,
        author: v.user.username,
        authorId: v.user.id,
        avatar: v.user.avatar,
        avatarUploadType: v.user.avatarUploadType,
        role: v.user.role,
        content: v.content,
        time: v.createAt,
        status: status,
        countLike: countLike,
        countDislike: countDislike,
      }
      result.push(tmp);
    }
    task = PublicModules.fun_makeResListSucc(result, total, null);

    return task;
  }

  async delete(req: any, id: number) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const find = await this.commentRepo.findOne({ where: { id: id, user: req.user.id } });
    if (!find) {
      task = PublicModules.fun_makeResNotFound(null, 'COMMENT');
      return task;
    }
    // soft remove
    const result = await this.commentRepo.softRemove(find);
    result.user = PublicModules.fun_secureUser(result.user);
    task = PublicModules.fun_makeResDeleteSucc(result);

    return task;
  }

  async edit(req: any, id: number, dto: UpdateCommentDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const find = await this.commentRepo.findOne({ where: { id: id, user: req.user.id } });
    if (!find) {
      task = PublicModules.fun_makeResNotFound(null, 'COMMENT');
      return task;
    }
    // update
    const newComment = this.commentRepo.merge(find, dto);
    const result = await this.commentRepo.save(newComment);
    const status = await this.cReactService.getCommentStatus(req.user.id, result.id);
    const countLike = await this.cReactService.countReact(result.id, COMMENT_REACT_TYPE.LIKE);
    const countDislike = await this.cReactService.countReact(result.id, COMMENT_REACT_TYPE.DISLIKE);
    task = PublicModules.fun_makeResUpdateSucc({
      id: result.id,
      author: req.user.username,
      authorId: req.user.id,
      content: result.content,
      time: result.createAt,
      status: status,
      countLike: countLike,
      countDislike: countDislike,
    });

    return task;
  }
}
