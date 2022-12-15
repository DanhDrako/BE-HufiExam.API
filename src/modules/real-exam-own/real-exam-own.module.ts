import { Module } from '@nestjs/common';
import { RealExamOwnService } from './real-exam-own.service';
import { RealExamOwnController } from './real-exam-own.controller';
import { PostModule } from '../post/post.module';
import { PublicModules } from 'src/common/PublicModules';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PublicModules.PASSPORT_MODULE,
    PostModule,
    AuthModule,
  ],
  controllers: [RealExamOwnController],
  providers: [RealExamOwnService],
  exports: [RealExamOwnService]
})
export class RealExamOwnModule {}
