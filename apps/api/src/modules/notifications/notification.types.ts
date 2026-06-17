/**
 * Notifications — ports & adapters.
 *
 * Sends transactional email / SMS (booking confirmations, reminders, etc.).
 * Provider details are hidden behind the `NotificationAdapter` port; swapping
 * MockNotificationAdapter for a real provider (SendGrid + Twilio) is the
 * integration point.
 */

export interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
}

export interface SendSmsInput {
  to: string;
  body: string;
}

export interface NotificationAdapter {
  sendEmail(input: SendEmailInput): Promise<{ id: string }>;
  sendSms(input: SendSmsInput): Promise<{ id: string }>;
}

/** DI token for the active NotificationAdapter implementation. */
export const NOTIFICATION_ADAPTER = Symbol('NOTIFICATION_ADAPTER');
