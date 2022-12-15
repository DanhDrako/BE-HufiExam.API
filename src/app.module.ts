import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from './orm.config';
import { CommandModule } from 'nestjs-command';
import { UserModule } from './modules/user/user.module';
import { CategoryModule } from './modules/category/category.module';
import { AuthModule } from './modules/auth/auth.module';
import { FilesModule } from './modules/files/files.module';
import { TagNameModule } from './modules/tag-name/tag-name.module';
import { PostModule } from './modules/post/post.module';
import { TestModule } from './modules/test/test.module';
import { UserReactModule } from './modules/user-react/user-react.module';
import { CommentModule } from './modules/comment/comment.module';
import { CommentReactModule } from './modules/comment-react/comment-react.module';
import { SupportModule } from './modules/support/support.module';
import { QuestionAnswerModule } from './modules/question-answer/question-answer.module';
import { ChatGateway } from "./chat.gateway";
import { User2userMessageModule } from './modules/user2user-message/user2user-message.module';
import { RankModule } from './rank/rank.module';
import { RealExamOwnModule } from './modules/real-exam-own/real-exam-own.module';
import { PriceGoldModule } from './modules/price-gold/price-gold.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    CommandModule,
    FilesModule,
    AuthModule,
    UserModule,
    CategoryModule,
    TagNameModule,
    PostModule,
    TestModule,
    UserReactModule,
    CommentModule,
    CommentReactModule,
    SupportModule,
    QuestionAnswerModule,
    User2userMessageModule,
    RankModule,
    RealExamOwnModule,
    PriceGoldModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
    ChatGateway,
  ],
})
export class AppModule { }
