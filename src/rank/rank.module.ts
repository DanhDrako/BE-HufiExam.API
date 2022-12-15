import { RealExamOwnModule } from './../modules/real-exam-own/real-exam-own.module';
import { RealExamOwn } from './../entities/real-exam-own.entity';
import { Module } from '@nestjs/common';
import { RankService } from './rank.service';
import { RankController } from './rank.controller';
import { PublicModules } from 'src/common/PublicModules';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserModule } from 'src/modules/user/user.module';
import { PostModule } from 'src/modules/post/post.module';

@Module({
  imports: [
    PublicModules.PASSPORT_MODULE,
    AuthModule,
    UserModule,
    PostModule,
    RealExamOwnModule,
  ],
  controllers: [RankController],
  providers: [RankService]
})
export class RankModule {}
