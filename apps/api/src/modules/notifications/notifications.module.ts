import { Module } from '@nestjs/common';
import { MockNotificationAdapter } from './mock-notification.adapter';
import { NOTIFICATION_ADAPTER } from './notification.types';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    // INTEGRATION POINT: bind a real adapter (SendGrid + Twilio) to
    // NOTIFICATION_ADAPTER here to send real messages.
    { provide: NOTIFICATION_ADAPTER, useClass: MockNotificationAdapter },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
