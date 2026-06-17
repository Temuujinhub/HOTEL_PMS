import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  NOTIFICATION_ADAPTER,
  NotificationAdapter,
  SendEmailInput,
  SendSmsInput,
} from './notification.types';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(NOTIFICATION_ADAPTER)
    private readonly adapter: NotificationAdapter,
  ) {}

  /** Send a transactional email. Used directly by other modules. */
  sendEmail(input: SendEmailInput): Promise<{ id: string }> {
    return this.adapter.sendEmail(input);
  }

  /** Send a transactional SMS. Used directly by other modules. */
  sendSms(input: SendSmsInput): Promise<{ id: string }> {
    return this.adapter.sendSms(input);
  }

  /**
   * Templated reservation-confirmation helper. Other modules call this after a
   * booking is confirmed. The template is intentionally simple here; a real
   * impl would render an HTML template per tenant brand.
   */
  async sendReservationConfirmation(params: {
    to: string;
    guestName: string;
    confirmationNo: string;
  }): Promise<{ id: string }> {
    this.logger.log(
      `Sending reservation confirmation ${params.confirmationNo} to ${params.to}`,
    );
    const subject = `Your booking is confirmed — ${params.confirmationNo}`;
    const body = `Hi ${params.guestName}, your reservation ${params.confirmationNo} is confirmed. We look forward to hosting you.`;
    return this.adapter.sendEmail({ to: params.to, subject, body });
  }
}
