import { Module } from '@nestjs/common';
import { ReservationsModule } from '../reservations/reservations.module';
import { LocksModule } from '../locks/locks.module';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

@Module({
  imports: [ReservationsModule, LocksModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
