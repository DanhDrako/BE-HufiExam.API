import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { MailBasicDto } from '../core/mail/dto/mail-basic.dto';
import { MailService } from '../core/mail/mail.service';

@Injectable()
export class TestService {
  constructor(
    private readonly mailService: MailService,
    private readonly authService: AuthService,
  ) {
  }

  async sendMail(req: any, to: string) {
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const dtoActive: MailBasicDto = new MailBasicDto();
    dtoActive.to = to;
    dtoActive.subject = 'Test Send Mail';
    dtoActive.html = '1234'
    return this.mailService.sendMail(dtoActive);
  }
}
