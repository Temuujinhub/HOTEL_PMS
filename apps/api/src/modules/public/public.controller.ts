import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PublicService } from './public.service';
import {
  KioskCheckInDto,
  KioskLookupDto,
  LookupQueryDto,
  PublicAvailabilityQueryDto,
  PublicBookingDto,
} from './dto/public.dto';

/**
 * Unauthenticated booking API for per-hotel public sites
 * (e.g. https://grand-aurora.mastrsys.com). All routes are @Public().
 */
@ApiTags('Public Booking')
@Public()
@Controller('public/properties')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get(':slug')
  getProperty(@Param('slug') slug: string) {
    return this.publicService.getProperty(slug);
  }

  @Get(':slug/availability')
  availability(@Param('slug') slug: string, @Query() query: PublicAvailabilityQueryDto) {
    return this.publicService.availability(slug, query);
  }

  @Post(':slug/reservations')
  book(@Param('slug') slug: string, @Body() dto: PublicBookingDto) {
    return this.publicService.book(slug, dto);
  }

  @Get(':slug/reservations/:confirmationNo')
  lookup(
    @Param('slug') slug: string,
    @Param('confirmationNo') confirmationNo: string,
    @Query() query: LookupQueryDto,
  ) {
    return this.publicService.lookup(slug, confirmationNo, query.lastName);
  }

  @Post(':slug/kiosk/lookup')
  @ApiOperation({ summary: 'Kiosk: find a booking by confirmation number + last name' })
  kioskLookup(@Param('slug') slug: string, @Body() dto: KioskLookupDto) {
    return this.publicService.kioskLookup(slug, dto);
  }

  @Post(':slug/kiosk/check-in')
  @ApiOperation({ summary: 'Kiosk: self-check-in and issue a room key' })
  kioskCheckIn(@Param('slug') slug: string, @Body() dto: KioskCheckInDto) {
    return this.publicService.kioskCheckIn(slug, dto);
  }
}
