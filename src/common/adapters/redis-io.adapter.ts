import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(
    app: any,
    private configService: ConfigService,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const host = this.configService.get<string>('redis.host') || 'localhost';
    const port = this.configService.get<number>('redis.port') || 6379;
    const password = this.configService.get<string>('redis.password');
    
    // Diagnostic logging
    console.log(`[RedisIoAdapter] Attempting connection. Host (truncated): ${host.substring(0, 30)}..., Port: ${port}`);

    let pubClient: Redis;
    if (host.startsWith('redis://') || host.startsWith('rediss://')) {
      pubClient = new Redis(host);
    } else {
      const redisConfig: any = {
        host,
        port,
      };
      if (password) {
        redisConfig.password = password;
      }
      pubClient = new Redis(redisConfig);
    }
    const subClient = pubClient.duplicate();

    // Register error handlers to prevent unhandled error event crashes
    pubClient.on('error', (err) => {
      console.error('[RedisIoAdapter] pubClient connection error:', err.message);
    });
    subClient.on('error', (err) => {
      console.error('[RedisIoAdapter] subClient connection error:', err.message);
    });

    // The ioredis clients will connect automatically
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
