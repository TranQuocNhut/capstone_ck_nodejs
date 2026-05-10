import { Module } from '@nestjs/common';
import { CinemasService } from './services/cinemas.service';
import { CinemasController } from './controllers/cinemas.controller';

@Module({
  controllers: [CinemasController],
  providers: [CinemasService],
  exports: [CinemasService],
})
export class CinemasModule {}
