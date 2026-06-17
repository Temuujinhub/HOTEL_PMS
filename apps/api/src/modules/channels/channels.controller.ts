import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReservationChannel, UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { ChannelsService } from './channels.service';
import { PushAvailabilityDto } from './dto/channel.dto';

@ApiTags('Channels')
@ApiBearerAuth()
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  @ApiOperation({ summary: 'List supported OTA channels and connection status' })
  listChannels() {
    return this.channelsService.listChannels();
  }

  @Post(':channel/sync')
  @Roles(UserRole.GM, UserRole.FRONT_DESK_MANAGER, UserRole.REVENUE_MANAGER)
  @ApiOperation({ summary: 'Pull reservations from an OTA channel (stub)' })
  syncChannel(
    @Param('channel') channel: ReservationChannel,
    @Query('propertyId') propertyId: string,
  ) {
    return this.channelsService.syncChannel(channel, propertyId);
  }

  @Post('availability')
  @Roles(UserRole.GM, UserRole.FRONT_DESK_MANAGER, UserRole.REVENUE_MANAGER)
  @ApiOperation({ summary: 'Push availability/rates to OTA channels (stub)' })
  pushAvailability(@Body() dto: PushAvailabilityDto) {
    return this.channelsService.pushAvailability(dto.propertyId, dto.items);
  }
}
