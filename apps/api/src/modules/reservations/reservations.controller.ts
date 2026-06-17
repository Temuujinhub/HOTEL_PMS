import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { ReservationsService } from './reservations.service';
import {
  AvailabilityQueryDto,
  CancelReservationDto,
  CheckInDto,
  CreateReservationDto,
  ReservationQueryDto,
  UpdateReservationDto,
} from './dto/reservation.dto';

@ApiTags('Reservations')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('availability')
  @ApiOperation({ summary: 'Check room availability for a date range' })
  availability(@Query() query: AvailabilityQueryDto) {
    return this.reservationsService.availability(query);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Reservations overlapping a window (timeline)' })
  calendar(
    @Query('propertyId', ParseUUIDPipe) propertyId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reservationsService.calendar(propertyId, from, to);
  }

  @Get()
  @ApiOperation({ summary: 'List reservations (paginated, filterable)' })
  findAll(@Query() query: ReservationQueryDto) {
    return this.reservationsService.findAll(query);
  }

  @Get(':id')
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.getOne(id);
  }

  @Post()
  @Roles(UserRole.FRONT_DESK_MANAGER, UserRole.FRONT_DESK, UserRole.GM)
  @ApiOperation({ summary: 'Create a reservation (auto-creates folio)' })
  create(@Body() dto: CreateReservationDto) {
    return this.reservationsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.FRONT_DESK_MANAGER, UserRole.FRONT_DESK, UserRole.GM)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateReservationDto) {
    return this.reservationsService.update(id, dto);
  }

  @Post(':id/check-in')
  @Roles(UserRole.FRONT_DESK_MANAGER, UserRole.FRONT_DESK, UserRole.GM)
  @ApiOperation({ summary: 'Check in a reservation' })
  checkIn(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CheckInDto) {
    return this.reservationsService.checkIn(id, dto);
  }

  @Post(':id/check-out')
  @Roles(UserRole.FRONT_DESK_MANAGER, UserRole.FRONT_DESK, UserRole.GM)
  @ApiOperation({ summary: 'Check out a reservation' })
  checkOut(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.checkOut(id);
  }

  @Post(':id/cancel')
  @Roles(UserRole.FRONT_DESK_MANAGER, UserRole.GM)
  @ApiOperation({ summary: 'Cancel a reservation' })
  cancel(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CancelReservationDto) {
    return this.reservationsService.cancel(id, dto);
  }
}
