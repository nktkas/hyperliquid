import type { WebSocketTransport } from "../../../transport/websocket/mod.ts";

/** Configuration for subscription API requests. */
export interface SubscriptionConfig<T extends WebSocketTransport = WebSocketTransport> {
  /** The transport used to connect to the Hyperliquid API. */
  transport: T;
}
