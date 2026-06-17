import { Module } from '@nestjs/common';
import { HousekeepingController } from './housekeeping.controller';
import { HousekeepingGateway } from './housekeeping.gateway';
import { HousekeepingService } from './housekeeping.service';

@Module({
  controllers: [HousekeepingController],
  providers: [HousekeepingService, HousekeepingGateway],
  exports: [HousekeepingService],
})
export class HousekeepingModule {}
