/**
 * Hyperliquid API TypeScript SDK.
 *
 * The main entrypoint exports:
 * - Transports: {@link HttpTransport}, {@link WebSocketTransport}
 * - Clients: {@link InfoClient}, {@link ExchangeClient}, {@link SubscriptionClient}
 *
 * For tree-shakeable, low-level access you can import request methods directly from:
 * - `@nktkas/hyperliquid/api/info`
 * - `@nktkas/hyperliquid/api/exchange`
 * - `@nktkas/hyperliquid/api/subscription`
 *
 * Extra utilities are available in:
 * - `@nktkas/hyperliquid/utils` (formatting, symbol conversion)
 * - `@nktkas/hyperliquid/signing` (low-level signing helpers)
 *
 * @example Quick start
 * ```ts
 * import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";
 *
 * const transport = new HttpTransport();
 * const info = new InfoClient({ transport });
 *
 * const mids = await info.allMids();
 * console.log(mids);
 * ```
 *
 * @module
 */

export * from "./_base.ts";
export * from "./transport/mod.ts";
export * from "./api/exchange/client.ts";
export * from "./api/info/client.ts";
export * from "./api/subscription/client.ts";
