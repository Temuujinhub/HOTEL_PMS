/**
 * OTA channel manager — ports & adapters.
 *
 * Connects the PMS to online travel agencies (Booking.com, Airbnb, Expedia,
 * Agoda, Trip.com, VRBO, Google) for two-way sync: pulling reservations in and
 * pushing availability/rates out. Each OTA has its own API, hidden behind the
 * `ChannelAdapter` port. Swapping MockChannelAdapter for a real implementation
 * is the integration point.
 */

export interface ChannelAdapter {
  /** Pull new/updated reservations from the OTA for a property. */
  pullReservations(propertyId: string): Promise<any[]>;
  /** Push availability / rate updates to the OTA for a property. */
  pushAvailability(
    propertyId: string,
    payload: unknown,
  ): Promise<{ updated: number }>;
}

/** DI token for the active ChannelAdapter implementation. */
export const CHANNEL_ADAPTER = Symbol('CHANNEL_ADAPTER');
