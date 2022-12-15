import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { TaskRes } from 'src/common/Classess';
import { REACT_TYPE } from 'src/common/Enums';
import { PublicModules } from 'src/common/PublicModules';
import { UserReact } from 'src/entities/user-react.entity';
import { User } from 'src/entities/user.entity';
import { Connection, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { PostService } from '../post/post.service';
import { CreateUserReactDto } from './dto/create-user-react.dto';

@Injectable()
export class UserReactService {
  private urRepo: Repository<UserReact> = null;

  constructor(
    private readonly connection: Connection,
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
    private readonly authService: AuthService,
  ) {
    this.urRepo = this.connection.getRepository(UserReact);
  }

  async create(req: any, dto: CreateUserReactDto) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const user:User = req.user;
    // find by post id
    const post = await this.postService.findById(dto.postId);
    if (!post) {
      task = PublicModules.fun_makeResNotFound(null, 'POST');
      return task;
    }

    // user reacted ?
    let find = await this.urRepo.findOne({
      where: {
        user: user.id,
        post: post.id,
        reactType: dto.reactType,
      }
    });

    // insert
    if (!find) {
      find = this.urRepo.create();
      find.user = user;
      find.post = post;
      find.reactType = dto.reactType;
      find.isReact = true;
      await this.urRepo.save(find);
      task = PublicModules.fun_makeResCreateSucc('result');
      return task;
    }

    // update
    find.isReact = !find.isReact;
    await this.urRepo.save(find);
    task = PublicModules.fun_makeResUpdateSucc('result');

    return task;
  }

  async countExam(postId: number) {
    let task: TaskRes = null;
    const result = await this.urRepo.count({
      where: {
        post: postId,
        reactType: REACT_TYPE.EXAM_COMMIT,
        isReact: true,
      }
    });

    task = PublicModules.fun_makeResFoundSucc(result);

    return task;
  }

  async countLike(postId: number) {
    let task: TaskRes = null;
    const result = await this.urRepo.count({
      where: {
        post: postId,
        reactType: REACT_TYPE.USER_LIKE,
        isReact: true,
      }
    });

    task = PublicModules.fun_makeResFoundSucc(result);

    return task;
  }

  async isReact(userId: string, postId: number, reactType: REACT_TYPE) {
    let result = false;
    const find = await this.urRepo.findOne({
      where: {
        user: userId,
        post: postId,
        reactType: reactType,
      }
    });
    if (find) result = find.isReact;

    return result;
  }
}
