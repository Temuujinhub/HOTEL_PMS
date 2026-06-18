import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateCredentialDto } from './dto/lock.dto';
import { LocksService } from './locks.service';

@ApiTags('Locks')
@ApiBearerAuth()
@Controller('locks')
export class LocksController {
  constructor(private readonly locksService: LocksService) {}

  @Post('credentials')
  @Roles(UserRole.FRONT_DESK_MANAGER, UserRole.FRONT_DESK, UserRole.GM)
  @ApiOperation({ summary: 'Issue a smart-lock credential for a reservation' })
  createCredential(@Body() dto: CreateCredentialDto) {
    return this.locksService.createCredential(dto);
  }

  @Get('reservations/:reservationId/credentials')
  @Roles(UserRole.FRONT_DESK_MANAGER, UserRole.FRONT_DESK, UserRole.GM)
  @ApiOperation({ summary: 'List a reservation’s issued credentials (secrets masked)' })
  listForReservation(@Param('reservationId', ParseUUIDPipe) reservationId: string) {
    return this.locksService.listForReservation(reservationId);
  }

  @Delete('credentials/:id')
  @Roles(UserRole.FRONT_DESK_MANAGER, UserRole.FRONT_DESK, UserRole.GM)
  @ApiOperation({ summary: 'Revoke a smart-lock credential' })
  revokeCredential(@Param('id', ParseUUIDPipe) id: string) {
    return this.locksService.revokeCredential(id);
  }
}
