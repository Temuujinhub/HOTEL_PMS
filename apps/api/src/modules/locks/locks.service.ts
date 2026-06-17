import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCredentialDto } from './dto/lock.dto';
import { LockAdapter, LockCredential, LOCK_ADAPTER } from './lock.types';

@Injectable()
export class LocksService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(LOCK_ADAPTER) private readonly lockAdapter: LockAdapter,
  ) {}

  /**
   * Issue a smart-lock credential for a reservation. Validates that the room
   * (and, when supplied, the reservation) exist within the tenant before
   * delegating to the provider adapter.
   */
  async createCredential(dto: CreateCredentialDto): Promise<LockCredential> {
    const room = await this.prisma.scoped.room.findFirst({
      where: { id: dto.roomId },
    });
    if (!room) throw new NotFoundException('Room not found');

    const reservation = await this.prisma.scoped.reservation.findFirst({
      where: { id: dto.reservationId },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    // INTEGRATION POINT: lockAdapter is the MockLockAdapter today; swap it for a
    // real provider adapter to provision against physical locks.
    return this.lockAdapter.createCredential({
      reservationId: dto.reservationId,
      roomId: dto.roomId,
      lockProvider: dto.lockProvider,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      credentialType: dto.credentialType,
    });
  }

  /** Revoke a previously issued credential. */
  async revokeCredential(credentialId: string): Promise<{ success: boolean }> {
    await this.lockAdapter.revokeCredential(credentialId);
    return { success: true };
  }
}
