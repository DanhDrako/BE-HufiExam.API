import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { PublicModules } from 'src/common/PublicModules';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PublicModules.PASSPORT_MODULE,
    AuthModule,
  ],
  controllers: [SupportController],
  providers: [SupportService]
})
export class SupportModule { }
