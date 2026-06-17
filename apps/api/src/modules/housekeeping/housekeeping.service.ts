import { Injectable, NotFoundException } from '@nestjs/common';
import { HousekeepingStatus, Prisma, RoomStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContextService } from '../../common/tenancy/tenant-context.service';
import { HousekeepingGateway } from './housekeeping.gateway';
import {
  AddPhotosDto,
  AssignDto,
  CreateHousekeepingTaskDto,
  HousekeepingQueryDto,
  UpdateStatusDto,
} from './dto/housekeeping.dto';

@Injectable()
export class HousekeepingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly gateway: HousekeepingGateway,
  ) {}

  findTasks(query: HousekeepingQueryDto) {
    const where: Prisma.HousekeepingTaskWhereInput = {};
    if (query.propertyId) where.propertyId = query.propertyId;
    if (query.status) where.status = query.status;
    if (query.assignedToId) where.assignedToId = query.assignedToId;
    if (query.roomId) where.roomId = query.roomId;
    return this.prisma.scoped.housekeepingTask.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      include: {
        room: { select: { roomNumber: true, floor: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async getTask(id: string) {
    const task = await this.prisma.scoped.housekeepingTask.findFirst({
      where: { id },
      include: {
        room: { select: { roomNumber: true, floor: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
      },
    });
    if (!task) throw new NotFoundException('Housekeeping task not found');
    return task;
  }

  async create(dto: CreateHousekeepingTaskDto) {
    const task = await this.prisma.housekeepingTask.create({
      data: {
        tenantId: this.tenantContext.requireTenantId(),
        propertyId: dto.propertyId,
        roomId: dto.roomId,
        type: dto.type,
        priority: dto.priority,
        assignedToId: dto.assignedToId,
        reservationId: dto.reservationId,
        notes: dto.notes,
      },
    });
    this.gateway.emitTaskUpdated(task);
    return task;
  }

  /** Assign a task to a housekeeper; sets assignedAt, leaves status untouched. */
  async assign(id: string, dto: AssignDto) {
    await this.getTask(id);
    const task = await this.prisma.housekeepingTask.update({
      where: { id },
      data: { assignedToId: dto.assignedToId, assignedAt: new Date() },
    });
    this.gateway.emitTaskUpdated(task);
    return task;
  }

  /**
   * Transition a task's status. Side effects:
   *  - IN_PROGRESS  -> startedAt = now
   *  - COMPLETED    -> completedAt = now, room.status = CLEAN
   *  - INSPECTED    -> inspectedAt = now, inspectedById = current user, room.status = INSPECTED
   *  - REJECTED     -> room left DIRTY (no room update)
   */
  async updateStatus(id: string, dto: UpdateStatusDto, userId?: string) {
    const existing = await this.getTask(id);
    const now = new Date();
    const data: Prisma.HousekeepingTaskUncheckedUpdateInput = { status: dto.status };

    if (dto.status === HousekeepingStatus.IN_PROGRESS) {
      data.startedAt = now;
    } else if (dto.status === HousekeepingStatus.COMPLETED) {
      data.completedAt = now;
    } else if (dto.status === HousekeepingStatus.INSPECTED) {
      data.inspectedAt = now;
      data.inspectedById = userId;
    }

    const task = await this.prisma.housekeepingTask.update({
      where: { id },
      data,
    });

    // Reflect the cleaning outcome on the room itself.
    if (dto.status === HousekeepingStatus.COMPLETED) {
      await this.prisma.room.update({
        where: { id: existing.roomId },
        data: { status: RoomStatus.CLEAN },
      });
    } else if (dto.status === HousekeepingStatus.INSPECTED) {
      await this.prisma.room.update({
        where: { id: existing.roomId },
        data: { status: RoomStatus.INSPECTED },
      });
    }
    // REJECTED intentionally leaves the room DIRTY.

    this.gateway.emitTaskUpdated(task);
    return task;
  }

  /** Append photo URLs to the task's photos JSON array. */
  async addPhotos(id: string, dto: AddPhotosDto) {
    const existing = await this.getTask(id);
    const current = Array.isArray(existing.photos)
      ? (existing.photos as string[])
      : [];
    const photos = [...current, ...dto.photos];
    const task = await this.prisma.housekeepingTask.update({
      where: { id },
      data: { photos: photos as Prisma.InputJsonValue },
    });
    this.gateway.emitTaskUpdated(task);
    return task;
  }
}
