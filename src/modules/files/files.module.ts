import { HttpModule, Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { PublicModules } from 'src/common/PublicModules';
import { PostModule } from '../post/post.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    HttpModule,
    PublicModules.PASSPORT_MODULE,
    PostModule,
    AuthModule,
  ],
  controllers: [FilesController],
  providers: [
    FilesService,
  ]
})
export class FilesModule { }
