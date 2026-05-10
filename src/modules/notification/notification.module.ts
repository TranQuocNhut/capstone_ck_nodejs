import { Module } from '@nestjs/common';
import { QueueModule } from '../../providers/queue/queue.module';
import { NotificationProcessor } from './processors/notification.processor';

@Module({
  imports: [QueueModule],
  providers: [NotificationProcessor],
})
export class NotificationModule {}
