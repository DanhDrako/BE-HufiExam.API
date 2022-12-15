import { Module } from '@nestjs/common';
import { TagNameService } from './tag-name.service';
import { TagNameController } from './tag-name.controller';
import { PublicModules } from 'src/common/PublicModules';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PublicModules.PASSPORT_MODULE,
    AuthModule,
  ],
  controllers: [TagNameController],
  providers: [TagNameService],
  exports: [
    TagNameService,
  ],
})
export class TagNameModule {}
