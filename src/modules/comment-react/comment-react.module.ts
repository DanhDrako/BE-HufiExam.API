import { forwardRef, Module } from '@nestjs/common';
import { CommentReactService } from './comment-react.service';
import { CommentReactController } from './comment-react.controller';
import { PublicModules } from 'src/common/PublicModules';
import { CommentModule } from '../comment/comment.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PublicModules.PASSPORT_MODULE,
    forwardRef(() => CommentModule),
    AuthModule,
  ],
  controllers: [CommentReactController],
  providers: [CommentReactService],
  exports: [CommentReactService],
})
export class CommentReactModule {}
