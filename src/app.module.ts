import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { configValidationSchema } from './config/config.validation';
import { PrismaModule } from './providers/database/prisma.module';
import { LoggerModule } from './providers/logger/logger.module';
import { RedisModule } from './providers/redis/redis.module';
import { QueueModule } from './providers/queue/queue.module';
import { MailModule } from './providers/mail/mail.module';
import { CloudinaryModule } from './providers/cloudinary/cloudinary.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationModule } from './modules/notification/notification.module';
import { HealthModule } from './modules/health/health.module';
import { MoviesModule } from './modules/movies/movies.module';
import { CinemasModule } from './modules/cinemas/cinemas.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
    }),

    // Throttler / Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Database
    PrismaModule,

    // Core Providers
    LoggerModule,
    RedisModule,
    QueueModule,
    MailModule,
    CloudinaryModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    ChatModule,
    NotificationModule,
    HealthModule,
    MoviesModule,
    CinemasModule,
    BookingsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
