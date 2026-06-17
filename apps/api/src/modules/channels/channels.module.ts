import { Module } from '@nestjs/common';
import { CHANNEL_ADAPTER } from './channel.types';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { MockChannelAdapter } from './mock-channel.adapter';

@Module({
  controllers: [ChannelsController],
  providers: [
    ChannelsService,
    // INTEGRATION POINT: bind a real channel-manager adapter to CHANNEL_ADAPTER
    // here to enable live two-way OTA sync.
    { provide: CHANNEL_ADAPTER, useClass: MockChannelAdapter },
  ],
  exports: [ChannelsService],
})
export class ChannelsModule {}
