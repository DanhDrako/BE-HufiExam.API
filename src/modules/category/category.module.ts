import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { PublicModules } from 'src/common/PublicModules';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PublicModules.PASSPORT_MODULE,
    AuthModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [
    CategoryService,
  ]
})
export class CategoryModule {}
