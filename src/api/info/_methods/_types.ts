import type { HttpTransport } from "../../../transport/http/mod.ts";
import type { WebSocketTransport } from "../../../transport/websocket/mod.ts";

/** Configuration for Info API requests. */
export interface InfoConfig<T extends HttpTransport | WebSocketTransport = HttpTransport | WebSocketTransport> {
  /** The transport used to connect to the Hyperliquid API. */
  transport: T;
}
