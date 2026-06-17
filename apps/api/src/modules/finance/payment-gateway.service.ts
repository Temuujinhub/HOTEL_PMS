import { Injectable, Logger } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { randomUUID } from 'crypto';

export interface ChargeRequest {
  amount: number;
  currency: string;
  method: PaymentMethod;
  gateway?: string;
  token?: string;
  reference?: string;
}

export interface ChargeResult {
  success: boolean;
  gateway: string;
  gatewayRef: string;
  last4?: string;
  failureReason?: string;
}

/**
 * Payment gateway abstraction. This MOCK implementation always succeeds and is
 * the single integration point for real PSPs.
 *
 * To go live, implement provider adapters (Stripe / Adyen / QPay) behind this
 * same interface and select by `request.gateway`. Per the security spec, card
 * data is tokenised client-side and never stored — only the gateway reference
 * and last 4 digits are persisted.
 */
@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    const gateway = request.gateway ?? this.defaultGatewayFor(request.method);
    this.logger.log(
      `[MOCK] Charging ${request.amount} ${request.currency} via ${gateway} (${request.method})`,
    );
    // Simulated success — replace with real PSP call.
    return {
      success: true,
      gateway,
      gatewayRef: `mock_${gateway}_${randomUUID()}`,
      last4: request.method === PaymentMethod.CARD ? '4242' : undefined,
    };
  }

  async refund(gatewayRef: string, amount: number, currency: string): Promise<ChargeResult> {
    this.logger.log(`[MOCK] Refunding ${amount} ${currency} for ${gatewayRef}`);
    return {
      success: true,
      gateway: 'mock',
      gatewayRef: `mock_refund_${randomUUID()}`,
    };
  }

  private defaultGatewayFor(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.QPAY:
        return 'qpay';
      case PaymentMethod.CARD:
        return 'stripe';
      default:
        return 'manual';
    }
  }
}
