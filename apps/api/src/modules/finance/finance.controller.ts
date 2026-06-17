import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { FinanceService } from './finance.service';
import {
  AddChargeDto,
  AddPaymentDto,
  FolioQueryDto,
  RefundDto,
} from './dto/finance.dto';

@ApiTags('Finance')
@ApiBearerAuth()
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('folios')
  @ApiOperation({ summary: 'List folios (paginated)' })
  listFolios(@Query() query: FolioQueryDto) {
    return this.financeService.listFolios(query);
  }

  @Get('folios/:id')
  getFolio(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.getFolio(id);
  }

  @Get('reservations/:reservationId/folio')
  @ApiOperation({ summary: 'Get the folio for a reservation' })
  getByReservation(@Param('reservationId', ParseUUIDPipe) reservationId: string) {
    return this.financeService.getFolioByReservation(reservationId);
  }

  @Post('folios/:id/charges')
  @Roles(UserRole.FRONT_DESK_MANAGER, UserRole.FRONT_DESK, UserRole.FINANCE_MANAGER, UserRole.GM)
  @ApiOperation({ summary: 'Post a charge to a folio' })
  addCharge(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddChargeDto) {
    return this.financeService.addCharge(id, dto);
  }

  @Post('folios/:id/payments')
  @Roles(UserRole.FRONT_DESK_MANAGER, UserRole.FRONT_DESK, UserRole.FINANCE_MANAGER, UserRole.GM)
  @ApiOperation({ summary: 'Take a payment against a folio' })
  addPayment(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddPaymentDto) {
    return this.financeService.addPayment(id, dto);
  }

  @Post('folios/:id/refunds')
  @Roles(UserRole.FINANCE_MANAGER, UserRole.GM)
  @ApiOperation({ summary: 'Refund against a folio' })
  refund(@Param('id', ParseUUIDPipe) id: string, @Body() dto: RefundDto) {
    return this.financeService.refund(id, dto);
  }
}
