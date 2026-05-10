import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) { }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Chào mừng bạn đến với Capstone!',
      template: './welcome', // points to templates/welcome.hbs
      context: {
        name,
      },
    });
  }

  async sendResetPasswordEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `http://localhost:3000/api/v1/auth/reset-password?token=${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Yêu cầu khôi phục mật khẩu',
      template: './reset-password', // points to templates/reset-password.hbs
      context: {
        name,
        resetUrl,
      },
    });
  }
}
