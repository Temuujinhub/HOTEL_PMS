import { Module } from '@nestjs/common';
import { ReservationsModule } from '../reservations/reservations.module';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

@Module({
  imports: [ReservationsModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
