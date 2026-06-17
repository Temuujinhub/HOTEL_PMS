/**
 * Smart-lock integration — ports & adapters.
 *
 * The PMS issues guest access credentials (digital keys, RFID cards, PIN codes)
 * by talking to a smart-lock provider (Salto, VingCard, Dormakaba, Nuki,
 * Igloohome, Kisi). Each provider exposes a different REST API, so we hide them
 * behind the `LockAdapter` port. Swapping the implementation (see
 * MockLockAdapter) is the single integration point for going live.
 */

import { LockProvider } from '@prisma/client';

export type LockCredentialType = 'digital_key' | 'rfid_card' | 'pin_code';

export interface LockCredentialInput {
  reservationId: string;
  roomId: string;
  lockProvider: LockProvider;
  /** ISO-8601 datetime the credential becomes valid. */
  checkIn: string;
  /** ISO-8601 datetime the credential expires. */
  checkOut: string;
  credentialType: LockCredentialType;
}

export interface LockCredential {
  credentialId: string;
  provider: LockProvider;
  credentialType: LockCredentialType;
  /** Populated for `pin_code` credentials. */
  pinCode?: string | null;
  /** Populated for `digital_key` credentials. */
  digitalKeyToken?: string | null;
  validFrom: string;
  validUntil: string;
  status: string;
}

/**
 * Port implemented by every smart-lock provider adapter. Real adapters call the
 * provider's REST API; the mock returns synthetic data for local development.
 */
export interface LockAdapter {
  createCredential(input: LockCredentialInput): Promise<LockCredential>;
  revokeCredential(credentialId: string): Promise<void>;
}

/** DI token for the active LockAdapter implementation. */
export const LOCK_ADAPTER = Symbol('LOCK_ADAPTER');
