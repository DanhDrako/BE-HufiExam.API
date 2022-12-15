import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { TaskRes } from 'src/common/Classess';
import { COMMENT_REACT_TYPE } from 'src/common/Enums';
import { PublicModules } from 'src/common/PublicModules';
import { CommentReact } from 'src/entities/comment-react.entity';
import { Connection, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { CommentService } from '../comment/comment.service';
import { CreateCommentReactDto } from './dto/create-comment-react.dto';

@Injectable()
export class CommentReactService {
  private crRepo: Repository<CommentReact> = null;

  constructor(
    private readonly connection: Connection,
    @Inject(forwardRef(() => CommentService))
    private readonly commentService: CommentService,
    private readonly authService: AuthService,
  ) {
    this.crRepo = this.connection.getRepository(CommentReact);
  }

  async react(req: any, dto: CreateCommentReactDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const user = req.user;
    // find comment by id
    const commentFind = await this.commentService.findById(dto.id);
    if (!commentFind) {
      task = PublicModules.fun_makeResNotFound(null, 'Comment');
      return task;
    }
    // find commentReact
    let commentReactFind = await this.crRepo.findOne({
      where: {
        user: user.id,
        comment: commentFind.id,
      }
    });
    // insert new
    if (!commentReactFind) {
      commentReactFind = this.crRepo.create();
      commentReactFind.user = user;
      commentReactFind.comment = commentFind;
      commentReactFind.status = dto.status;
      const result = await this.crRepo.save(commentReactFind);
      task = PublicModules.fun_makeResCreateSucc(result);
      return task;
    }
    // update
    commentReactFind.status = dto.status;
    const result = await this.crRepo.save(commentReactFind);
    result.user = PublicModules.fun_secureUser(result.user);
    task = PublicModules.fun_makeResUpdateSucc(result);

    return task;
  }

  async getCommentStatus(userId: string, commentId: number) {
    let result = COMMENT_REACT_TYPE.NOTHING;
    if (!userId || !commentId) return result;
    const find = await this.crRepo.findOne({
      where: {
        user: userId,
        comment: commentId,
      }
    });
    if (find) return find.status;

    return result;
  }

  async isUserCommented(userId: string, postId: number) {
    if (!userId) return false;
    const find = await this.crRepo.createQueryBuilder('cReact')
      .innerJoin('cReact.user', 'user')
      .innerJoin('cReact.comment', 'comment')
      .innerJoin('comment.post', 'post')
      .where('user.id = :id', { id: userId })
      .andWhere('post.id = :postId', { postId: postId })
      .getOne();
    return find != null;
  }

  async countReact(commentId: number, status: COMMENT_REACT_TYPE) {
    if (status === COMMENT_REACT_TYPE.NOTHING) return 0;
    return this.crRepo.createQueryBuilder('CommentReact')
      .innerJoin('CommentReact.comment', 'comment')
      .where('comment.id = :id', { id: commentId })
      .andWhere('CommentReact.status = :status', { status: status })
      .getCount();
  }

  async countComment(postId: number) {
    if (!postId) return 0;
    return this.commentService.getRepo().createQueryBuilder('comment')
      .innerJoin('comment.post', 'post')
      .where('post.id = :id', { id: postId })
      .getCount();
  }
}
