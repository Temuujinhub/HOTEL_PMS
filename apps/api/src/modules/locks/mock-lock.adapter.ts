import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  LockAdapter,
  LockCredential,
  LockCredentialInput,
} from './lock.types';

/**
 * STUB adapter. Generates synthetic credentials so the rest of the system can
 * be developed and tested without a live smart-lock account.
 *
 * INTEGRATION POINT: replace this with a real provider adapter (e.g.
 * SaltoLockAdapter, NukiLockAdapter) that calls the provider's REST API to
 * provision and revoke access. Bind the real class to the LOCK_ADAPTER token in
 * locks.module.ts — no other code needs to change.
 */
@Injectable()
export class MockLockAdapter implements LockAdapter {
  private readonly logger = new Logger(MockLockAdapter.name);

  async createCredential(input: LockCredentialInput): Promise<LockCredential> {
    // Real adapter: POST to the provider, passing the lock device id + window.
    const credentialId = randomUUID();
    const cardId =
      input.credentialType === 'rfid_card'
        ? randomUUID().replace(/-/g, '').slice(0, 14).toUpperCase()
        : null;
    const pinCode =
      input.credentialType === 'pin_code'
        ? String(Math.floor(100000 + Math.random() * 900000))
        : null;
    const digitalKeyToken =
      input.credentialType === 'digital_key'
        ? Buffer.from(`${credentialId}:${input.roomId}`).toString('base64')
        : null;

    this.logger.debug(
      `[MOCK] issued ${input.credentialType} credential ${credentialId} for room ${input.roomId} via ${input.lockProvider}`,
    );

    return {
      credentialId,
      provider: input.lockProvider,
      credentialType: input.credentialType,
      cardId,
      pinCode,
      digitalKeyToken,
      validFrom: input.checkIn,
      validUntil: input.checkOut,
      status: 'active',
    };
  }

  async revokeCredential(credentialId: string): Promise<void> {
    // Real adapter: DELETE / revoke call to the provider.
    this.logger.debug(`[MOCK] revoked credential ${credentialId}`);
  }
}
