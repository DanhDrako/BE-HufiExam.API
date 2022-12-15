import { forwardRef, Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PublicModules } from 'src/common/PublicModules';
import { PostModule } from '../post/post.module';
import { CommentReactModule } from '../comment-react/comment-react.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PublicModules.PASSPORT_MODULE,
    forwardRef(() => PostModule),
    forwardRef(() => CommentReactModule),
    AuthModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
