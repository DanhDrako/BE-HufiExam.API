import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PublicModules } from 'src/common/PublicModules';
import { CategoryModule } from '../category/category.module';
import { TagNameModule } from '../tag-name/tag-name.module';
import { UserReactModule } from '../user-react/user-react.module';
import { CommentReactModule } from '../comment-react/comment-react.module';
import { QuestionAnswerModule } from '../question-answer/question-answer.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PublicModules.PASSPORT_MODULE,
    CategoryModule,
    TagNameModule,
    UserReactModule,
    CommentReactModule,
    QuestionAnswerModule,
    AuthModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService,]
})
export class PostModule { }
