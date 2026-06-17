import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  NotificationAdapter,
  SendEmailInput,
  SendSmsInput,
} from './notification.types';

/**
 * STUB adapter. Logs the message and returns a fake id so flows that send
 * notifications can run without real provider credentials.
 *
 * INTEGRATION POINT: replace with a real implementation that sends email via
 * SendGrid and SMS via Twilio. Bind the real class to NOTIFICATION_ADAPTER in
 * notifications.module.ts.
 */
@Injectable()
export class MockNotificationAdapter implements NotificationAdapter {
  private readonly logger = new Logger(MockNotificationAdapter.name);

  async sendEmail(input: SendEmailInput): Promise<{ id: string }> {
    // Real adapter: SendGrid API call.
    const id = randomUUID();
    this.logger.log(`[MOCK] email -> ${input.to} | "${input.subject}" (${id})`);
    return { id };
  }

  async sendSms(input: SendSmsInput): Promise<{ id: string }> {
    // Real adapter: Twilio API call.
    const id = randomUUID();
    this.logger.log(`[MOCK] sms -> ${input.to} (${id})`);
    return { id };
  }
}
