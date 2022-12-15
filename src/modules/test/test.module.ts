import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { MailModule } from '../core/mail/mail.module';
import { PublicModules } from 'src/common/PublicModules';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PublicModules.PASSPORT_MODULE,
    MailModule,
    AuthModule,
  ],
  controllers: [TestController],
  providers: [TestService]
})
export class TestModule {}
