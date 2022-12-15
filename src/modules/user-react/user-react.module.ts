import { forwardRef, Module } from '@nestjs/common';
import { UserReactService } from './user-react.service';
import { UserReactController } from './user-react.controller';
import { PublicModules } from 'src/common/PublicModules';
import { PostModule } from '../post/post.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PublicModules.PASSPORT_MODULE,
    forwardRef(() => PostModule),
    AuthModule,
  ],
  controllers: [UserReactController],
  providers: [UserReactService],
  exports: [UserReactService]
})
export class UserReactModule {}
