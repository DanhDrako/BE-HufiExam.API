import * as path from 'path';
import { Module, Global } from '@nestjs/common';
import { MailerModule } from "@nestjs-modules/mailer";
import { emailsConfig } from 'src/common/configs';
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: emailsConfig.domain,
          port: 587,
          auth: {
            user: emailsConfig.user,
            pass: emailsConfig.password
          },
          tls: true
        },
        defaults: {
          from: 'noreplay@myhufier.com',
        },
        template: {
          dir: path.resolve(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],

  providers: [
    MailService,
  ],

  exports: [
    MailService,
  ],
})
export class MailModule {}
