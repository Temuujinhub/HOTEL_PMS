import { Injectable, Logger } from '@nestjs/common';
import { ChannelAdapter } from './channel.types';

/**
 * STUB adapter. Returns empty/synthetic results so the channel-manager flows can
 * be exercised without live OTA credentials.
 *
 * INTEGRATION POINT: replace with a real implementation that authenticates with
 * each OTA and performs genuine two-way sync (pull reservations, push
 * availability + rates). Bind the real class to CHANNEL_ADAPTER in
 * channels.module.ts.
 */
@Injectable()
export class MockChannelAdapter implements ChannelAdapter {
  private readonly logger = new Logger(MockChannelAdapter.name);

  async pullReservations(propertyId: string): Promise<any[]> {
    // Real adapter: fetch reservations from the OTA API and map to PMS shape.
    this.logger.debug(`[MOCK] pullReservations for property ${propertyId}`);
    return [];
  }

  async pushAvailability(
    propertyId: string,
    payload: unknown,
  ): Promise<{ updated: number }> {
    // Real adapter: push ARI (availability/rates/inventory) to the OTA API.
    const items = Array.isArray((payload as any)?.items)
      ? (payload as any).items
      : [];
    this.logger.debug(
      `[MOCK] pushAvailability for property ${propertyId} (${items.length} items)`,
    );
    return { updated: items.length };
  }
}
