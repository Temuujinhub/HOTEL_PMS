import { Module } from '@nestjs/common';
import { LocksController } from './locks.controller';
import { LocksService } from './locks.service';
import { LOCK_ADAPTER } from './lock.types';
import { MockLockAdapter } from './mock-lock.adapter';

@Module({
  controllers: [LocksController],
  providers: [
    LocksService,
    // INTEGRATION POINT: bind a real provider adapter to LOCK_ADAPTER here to
    // go live (e.g. { provide: LOCK_ADAPTER, useClass: SaltoLockAdapter }).
    { provide: LOCK_ADAPTER, useClass: MockLockAdapter },
  ],
  exports: [LocksService],
})
export class LocksModule {}
