import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

/**
 * Realtime gateway for housekeeping events. Front-desk / housekeeping clients
 * subscribe on the `/realtime` namespace and receive task updates live.
 */
@WebSocketGateway({ namespace: '/realtime', cors: { origin: '*' } })
export class HousekeepingGateway {
  @WebSocketServer()
  server?: Server;

  /** Broadcast a housekeeping task change to all connected clients. */
  emitTaskUpdated(task: unknown): void {
    // Guard against the server not yet being initialised (e.g. unit tests,
    // before the websocket adapter has bootstrapped).
    this.server?.emit('housekeeping.task.updated', task);
  }
}
