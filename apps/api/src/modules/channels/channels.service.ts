import { Inject, Injectable } from '@nestjs/common';
import { ReservationChannel } from '@prisma/client';
import { CHANNEL_ADAPTER, ChannelAdapter } from './channel.types';

/** Human-readable names for the OTA channels we support. */
const SUPPORTED_CHANNELS: { channel: ReservationChannel; name: string }[] = [
  { channel: ReservationChannel.BOOKING_COM, name: 'Booking.com' },
  { channel: ReservationChannel.AIRBNB, name: 'Airbnb' },
  { channel: ReservationChannel.EXPEDIA, name: 'Expedia' },
  { channel: ReservationChannel.AGODA, name: 'Agoda' },
  { channel: ReservationChannel.TRIP_COM, name: 'Trip.com' },
  { channel: ReservationChannel.VRBO, name: 'VRBO' },
  { channel: ReservationChannel.GOOGLE, name: 'Google' },
];

@Injectable()
export class ChannelsService {
  constructor(
    @Inject(CHANNEL_ADAPTER) private readonly channelAdapter: ChannelAdapter,
  ) {}

  /** List supported OTA channels with their (mock) connection status. */
  listChannels() {
    // INTEGRATION POINT: `connected` is hard-coded false here; a real impl would
    // reflect whether valid OTA credentials are configured for the tenant.
    return SUPPORTED_CHANNELS.map((c) => ({
      channel: c.channel,
      name: c.name,
      connected: false,
      twoWaySync: true,
    }));
  }

  /** Pull reservations from a single OTA channel (mock). */
  async syncChannel(channel: ReservationChannel, propertyId: string) {
    const reservations = await this.channelAdapter.pullReservations(propertyId);
    return { channel, imported: reservations.length };
  }

  /** Push availability/rates to the OTA channels (mock). */
  async pushAvailability(propertyId: string, items?: unknown[]) {
    return this.channelAdapter.pushAvailability(propertyId, { items });
  }
}
