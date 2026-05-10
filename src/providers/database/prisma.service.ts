import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();

    // Prisma Soft Delete Extension logic can be added here
    // using Prisma Client Extensions if using Prisma > 4.16.0
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
