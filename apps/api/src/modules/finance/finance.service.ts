import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentDirection, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContextService } from '../../common/tenancy/tenant-context.service';
import { paginate } from '../../common/dto/pagination.dto';
import { PaymentGatewayService } from './payment-gateway.service';
import {
  AddChargeDto,
  AddPaymentDto,
  FolioQueryDto,
  RefundDto,
} from './dto/finance.dto';

@Injectable()
export class FinanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly gateway: PaymentGatewayService,
  ) {}

  async listFolios(query: FolioQueryDto) {
    const where: Prisma.FolioWhereInput = {};
    if (query.propertyId) where.propertyId = query.propertyId;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.scoped.folio.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          guest: { select: { id: true, firstName: true, lastName: true } },
          reservation: { select: { id: true, confirmationNo: true } },
        },
      }),
      this.prisma.scoped.folio.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async getFolio(id: string) {
    const folio = await this.prisma.scoped.folio.findFirst({
      where: { id },
      include: this.folioInclude(),
    });
    if (!folio) throw new NotFoundException('Folio not found');
    return folio;
  }

  async getFolioByReservation(reservationId: string) {
    const folio = await this.prisma.scoped.folio.findFirst({
      where: { reservationId },
      include: this.folioInclude(),
    });
    if (!folio) throw new NotFoundException('Folio not found for this reservation');
    return folio;
  }

  async addCharge(folioId: string, dto: AddChargeDto) {
    const tenantId = this.tenantContext.requireTenantId();
    const folio = await this.getFolio(folioId);
    if (folio.status === 'VOID') {
      throw new BadRequestException('Cannot add charges to a void folio');
    }
    const quantity = dto.quantity ?? 1;
    const amount = this.money(dto.unitAmount * quantity);

    await this.prisma.folioItem.create({
      data: {
        tenantId,
        folioId,
        type: dto.type,
        description: dto.description,
        quantity,
        unitAmount: this.money(dto.unitAmount),
        amount,
        taxAmount: this.money(dto.taxAmount ?? 0),
        currency: folio.currency,
        reference: dto.reference,
        postedById: this.tenantContext.userId,
      },
    });

    return this.recompute(folioId);
  }

  async addPayment(folioId: string, dto: AddPaymentDto) {
    const tenantId = this.tenantContext.requireTenantId();
    const folio = await this.getFolio(folioId);
    if (folio.status === 'VOID') {
      throw new BadRequestException('Cannot pay a void folio');
    }

    const result = await this.gateway.charge({
      amount: dto.amount,
      currency: folio.currency,
      method: dto.method,
      gateway: dto.gateway,
      token: dto.token,
    });

    await this.prisma.payment.create({
      data: {
        tenantId,
        folioId,
        direction: PaymentDirection.CHARGE,
        method: dto.method,
        status: result.success ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
        amount: this.money(dto.amount),
        currency: folio.currency,
        gateway: result.gateway,
        gatewayRef: result.gatewayRef,
        last4: result.last4,
        failureReason: result.failureReason,
        processedById: this.tenantContext.userId,
      },
    });

    if (!result.success) {
      throw new BadRequestException(result.failureReason ?? 'Payment failed');
    }
    return this.recompute(folioId);
  }

  async refund(folioId: string, dto: RefundDto) {
    const tenantId = this.tenantContext.requireTenantId();
    const folio = await this.getFolio(folioId);
    const totalPaid = Number(folio.totalPayments);
    if (dto.amount > totalPaid) {
      throw new BadRequestException('Refund amount exceeds total payments');
    }

    const lastCharge = [...folio.payments]
      .reverse()
      .find((p) => p.direction === PaymentDirection.CHARGE && p.status === PaymentStatus.SUCCEEDED);

    const result = await this.gateway.refund(
      lastCharge?.gatewayRef ?? 'manual',
      dto.amount,
      folio.currency,
    );

    await this.prisma.payment.create({
      data: {
        tenantId,
        folioId,
        direction: PaymentDirection.REFUND,
        method: lastCharge?.method ?? 'CARD',
        status: PaymentStatus.SUCCEEDED,
        amount: this.money(dto.amount),
        currency: folio.currency,
        gateway: result.gateway,
        gatewayRef: result.gatewayRef,
        failureReason: dto.reason,
        processedById: this.tenantContext.userId,
      },
    });

    return this.recompute(folioId);
  }

  /** Recalculate folio totals from its items and payments. */
  private async recompute(folioId: string) {
    const folio = await this.prisma.scoped.folio.findFirst({
      where: { id: folioId },
      include: { items: true, payments: true },
    });
    if (!folio) throw new NotFoundException('Folio not found');

    const totalCharges = folio.items.reduce(
      (sum, i) => sum + Number(i.amount) + Number(i.taxAmount),
      0,
    );
    const totalPayments = folio.payments
      .filter((p) => p.status === PaymentStatus.SUCCEEDED)
      .reduce(
        (sum, p) => sum + (p.direction === PaymentDirection.CHARGE ? Number(p.amount) : -Number(p.amount)),
        0,
      );
    const balance = totalCharges - totalPayments;

    await this.prisma.folio.update({
      where: { id: folioId },
      data: {
        totalCharges: this.money(totalCharges),
        totalPayments: this.money(totalPayments),
        balance: this.money(balance),
      },
    });
    await this.prisma.reservation.update({
      where: { id: folio.reservationId },
      data: { paidAmount: this.money(totalPayments) },
    });

    return this.getFolio(folioId);
  }

  private folioInclude(): Prisma.FolioInclude {
    return {
      items: { orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { createdAt: 'asc' } },
      guest: { select: { id: true, firstName: true, lastName: true, email: true } },
      reservation: { select: { id: true, confirmationNo: true, checkInDate: true, checkOutDate: true } },
    };
  }

  private money(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
