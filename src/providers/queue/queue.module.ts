import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);
        const password =
          configService.get<string>('REDIS_PASSWORD') || undefined;

        if (host.startsWith('redis://') || host.startsWith('rediss://')) {
          const url = new URL(host);
          return {
            connection: {
              host: url.hostname,
              port: parseInt(url.port || '6379', 10),
              username: url.username || undefined,
              password: url.password || undefined,
              tls: host.startsWith('rediss://') ? {} : undefined,
            },
          };
        }

        return {
          connection: {
            host,
            port,
            password,
          },
        };
      },
    }),
    // Register Notification Queue
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
