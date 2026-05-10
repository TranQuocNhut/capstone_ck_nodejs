import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../../../providers/mail/mail.service';
import { Logger } from '@nestjs/common';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private mailService: MailService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}...`);

    try {
      switch (job.name) {
        case 'welcome_email': {
          const { email, fullName } = job.data;
          await this.mailService.sendWelcomeEmail(email, fullName);
          this.logger.log(
            `Welcome email successfully processed and sent to ${email}`,
          );
          break;
        }
        case 'reset_password_email': {
          const { email, fullName, token } = job.data;
          await this.mailService.sendResetPasswordEmail(email, fullName, token);
          this.logger.log(
            `Reset password email successfully processed and sent to ${email}`,
          );
          break;
        }
        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id} (${job.name})`, error);
      throw error; // Rethrow so BullMQ knows the job failed and can retry
    }
  }
}
