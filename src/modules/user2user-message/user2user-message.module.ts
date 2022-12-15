import { Module } from '@nestjs/common';
import { User2userMessageService } from './user2user-message.service';
import { User2userMessageController } from './user2user-message.controller';
import { PublicModules } from 'src/common/PublicModules';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PublicModules.PASSPORT_MODULE,
    AuthModule,
  ],
  controllers: [User2userMessageController],
  providers: [User2userMessageService],
  exports: [
    User2userMessageService,
  ],
})
export class User2userMessageModule { }
