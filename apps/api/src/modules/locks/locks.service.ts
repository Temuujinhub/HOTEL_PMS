import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  CredentialIssuedVia,
  LockCredentialKind,
  LockCredentialStatus,
  LockProvider,
} from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { TenantContextService } from '../../common/tenancy/tenant-context.service';
import { CreateCredentialDto } from './dto/lock.dto';
import { LockAdapter, LockCredentialType, LOCK_ADAPTER } from './lock.types';

const KIND_TO_PORT: Record<LockCredentialKind, LockCredentialType> = {
  RFID_CARD: 'rfid_card',
  PIN_CODE: 'pin_code',
  DIGITAL_KEY: 'digital_key',
};
const PORT_TO_KIND: Record<LockCredentialType, LockCredentialKind> = {
  rfid_card: 'RFID_CARD',
  pin_code: 'PIN_CODE',
  digital_key: 'DIGITAL_KEY',
};

export interface IssueCredentialParams {
  reservationId: string;
  roomId: string;
  /** Falls back to the room's configured provider when omitted. */
  provider?: LockProvider;
  type: LockCredentialKind;
  /** ISO datetime; defaults to the reservation window. */
  validFrom: Date;
  validUntil: Date;
  issuedVia: CredentialIssuedVia;
}

/** Issued credential with plaintext secrets — returned only at issue time. */
export interface IssuedCredential {
  id: string;
  credentialRef: string;
  provider: LockProvider;
  type: LockCredentialKind;
  status: LockCredentialStatus;
  issuedVia: CredentialIssuedVia;
  cardId: string | null;
  pinCode: string | null;
  digitalKeyToken: string | null;
  validFrom: Date;
  validUntil: Date;
}

@Injectable()
export class LocksService {
  private readonly logger = new Logger(LocksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly tenantContext: TenantContextService,
    @Inject(LOCK_ADAPTER) private readonly lockAdapter: LockAdapter,
  ) {}

  /**
   * Front-desk credential issuance (authenticated). Validates the room and
   * reservation, provisions via the provider adapter, and persists the record.
   */
  async createCredential(dto: CreateCredentialDto): Promise<IssuedCredential> {
    return this.issue({
      reservationId: dto.reservationId,
      roomId: dto.roomId,
      provider: dto.lockProvider,
      type: PORT_TO_KIND[dto.credentialType],
      validFrom: new Date(dto.checkIn),
      validUntil: new Date(dto.checkOut),
      issuedVia: CredentialIssuedVia.FRONT_DESK,
    });
  }

  /**
   * Core issuance routine shared by the front desk, automatic check-in, and the
   * self-service kiosk. Secrets (PIN / digital-key token) are encrypted at rest;
   * the plaintext is returned here once so the caller can show it to the guest.
   */
  async issue(params: IssueCredentialParams): Promise<IssuedCredential> {
    const room = await this.prisma.scoped.room.findFirst({
      where: { id: params.roomId },
    });
    if (!room) throw new NotFoundException('Room not found');

    const reservation = await this.prisma.scoped.reservation.findFirst({
      where: { id: params.reservationId },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    const provider = params.provider ?? room.lockProvider;

    // INTEGRATION POINT: lockAdapter is the MockLockAdapter today; swap it for a
    // real provider adapter to provision against physical locks.
    const issued = await this.lockAdapter.createCredential({
      reservationId: params.reservationId,
      roomId: params.roomId,
      lockProvider: provider,
      checkIn: params.validFrom.toISOString(),
      checkOut: params.validUntil.toISOString(),
      credentialType: KIND_TO_PORT[params.type],
    });

    const record = await this.prisma.lockCredential.create({
      data: {
        tenantId: this.tenantContext.requireTenantId(),
        propertyId: room.propertyId,
        reservationId: params.reservationId,
        roomId: params.roomId,
        provider,
        type: params.type,
        status: LockCredentialStatus.ACTIVE,
        issuedVia: params.issuedVia,
        credentialRef: issued.credentialId,
        cardId: issued.cardId ?? null,
        pinCode: this.crypto.encrypt(issued.pinCode),
        digitalKeyToken: this.crypto.encrypt(issued.digitalKeyToken),
        validFrom: params.validFrom,
        validUntil: params.validUntil,
      },
    });

    return {
      id: record.id,
      credentialRef: record.credentialRef,
      provider: record.provider,
      type: record.type,
      status: record.status,
      issuedVia: record.issuedVia,
      cardId: issued.cardId ?? null,
      pinCode: issued.pinCode ?? null,
      digitalKeyToken: issued.digitalKeyToken ?? null,
      validFrom: record.validFrom,
      validUntil: record.validUntil,
    };
  }

  /** List a reservation's credentials with secrets masked, for staff display. */
  async listForReservation(reservationId: string) {
    const rows = await this.prisma.scoped.lockCredential.findMany({
      where: { reservationId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((c) => ({
      id: c.id,
      provider: c.provider,
      type: c.type,
      status: c.status,
      issuedVia: c.issuedVia,
      cardId: c.cardId,
      hasPin: Boolean(c.pinCode),
      validFrom: c.validFrom,
      validUntil: c.validUntil,
      revokedAt: c.revokedAt,
    }));
  }

  /** Revoke a previously issued credential (by DB id). */
  async revokeCredential(credentialId: string): Promise<{ success: boolean }> {
    const credential = await this.prisma.scoped.lockCredential.findFirst({
      where: { id: credentialId },
    });
    if (!credential) throw new NotFoundException('Credential not found');

    await this.lockAdapter.revokeCredential(credential.credentialRef);
    await this.prisma.scoped.lockCredential.updateMany({
      where: { id: credentialId },
      data: { status: LockCredentialStatus.REVOKED, revokedAt: new Date() },
    });
    return { success: true };
  }
}
