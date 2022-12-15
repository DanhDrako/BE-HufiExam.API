import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PublicModules } from 'src/common/PublicModules';
import { AuthModule } from '../auth/auth.module';
import { User2userMessageModule } from '../user2user-message/user2user-message.module';

@Module({
  imports: [
    PublicModules.PASSPORT_MODULE,
    AuthModule,
    User2userMessageModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
