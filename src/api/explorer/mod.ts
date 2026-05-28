/**
 * This module re-exports all explorer-related API request functions and types.
 *
 * You can use raw functions to maximize tree-shaking in your app,
 * or to access {@link https://github.com/fabian-hiller/valibot | valibot} schemas Request/Response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { blockDetails } from "@nktkas/hyperliquid/api/explorer";
 * //       ^^^^^^^^^^^^
 * //       same name as in `ExplorerClient`
 *
 * const transport = new HttpTransport(); // only `HttpTransport` supports this API
 *
 * const data = await blockDetails(
 *   { transport }, // same params as in `ExplorerClient`
 *   { height: 123 },
 * );
 * ```
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { explorerBlock } from "@nktkas/hyperliquid/api/explorer";
 * //       ^^^^^^^^^^^^^
 * //       same name as in `ExplorerClient`
 *
 * const transport = new WebSocketTransport({ url: "wss://rpc.hyperliquid.xyz/ws" }); // only `WebSocketTransport` supports this API
 *
 * await explorerBlock(
 *   { transport }, // same params as in `ExplorerClient`
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @module
 */

export type { ExplorerConfig } from "./_methods/_base/mod.ts";

export * from "./_methods/blockDetails.ts";
export * from "./_methods/explorerBlock.ts";
export * from "./_methods/explorerTxs.ts";
export * from "./_methods/txDetails.ts";
export * from "./_methods/userDetails.ts";
