import { Module } from '@nestjs/common';
import { QuestionAnswerService } from './question-answer.service';
import { QuestionAnswerController } from './question-answer.controller';
import { PublicModules } from 'src/common/PublicModules';
import { AuthModule } from '../auth/auth.module';
import { PostModule } from '../post/post.module';

@Module({
  imports: [
    PublicModules.PASSPORT_MODULE,
    AuthModule,
  ],
  controllers: [QuestionAnswerController],
  providers: [QuestionAnswerService],
  exports: [QuestionAnswerService],
})
export class QuestionAnswerModule {}
