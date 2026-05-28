/**
 * Client for the Hyperliquid Explorer API endpoint.
 * @module
 */

import type {
  IRequestTransport,
  ISubscription,
  ISubscriptionTransport,
  WebSocketRequestError,
} from "../../transport/mod.ts";
import type { ExplorerConfig } from "./_methods/_base/mod.ts";

// ============================================================
// Methods Imports
// ============================================================

import { blockDetails, type BlockDetailsParameters, type BlockDetailsResponse } from "./_methods/blockDetails.ts";
import { explorerBlock, type ExplorerBlockEvent } from "./_methods/explorerBlock.ts";
import { explorerTxs, type ExplorerTxsEvent } from "./_methods/explorerTxs.ts";
import { txDetails, type TxDetailsParameters, type TxDetailsResponse } from "./_methods/txDetails.ts";
import { userDetails, type UserDetailsParameters, type UserDetailsResponse } from "./_methods/userDetails.ts";

// ============================================================
// Client
// ============================================================

/**
 * Access to the Hyperliquid blockchain explorer.
 *
 * Requests use an `HttpTransport` and subscriptions use a `WebSocketTransport`, both on the RPC endpoint.
 */
export class ExplorerClient<
  T extends IRequestTransport<"explorer"> | ISubscriptionTransport =
    & IRequestTransport<"explorer">
    & ISubscriptionTransport,
> {
  config_: ExplorerConfig<T>;

  /**
   * Creates an instance of the ExplorerClient.
   *
   * @param config Configuration for Explorer API requests. See {@link ExplorerConfig}.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * // `HttpTransport` on the RPC URL for requests, or `WebSocketTransport` on the RPC WebSocket URL for subscriptions
   * const transport = new hl.HttpTransport();
   *
   * const explorerClient = new hl.ExplorerClient({ transport });
   * ```
   */
  constructor(config: ExplorerConfig<T>) {
    this.config_ = config;
  }

  /**
   * Request block details by block height.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Response containing block information.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // only `HttpTransport` supports this API
   * const client = new hl.ExplorerClient({ transport });
   *
   * const data = await client.blockDetails({ height: 123 });
   * ```
   *
   * @see null
   */
  blockDetails(
    this: ExplorerClient<IRequestTransport<"explorer">>,
    params: BlockDetailsParameters,
    signal?: AbortSignal,
  ): Promise<BlockDetailsResponse> {
    return blockDetails(this.config_, params, signal);
  }

  /**
   * Subscribe to explorer block updates.
   *
   * @param listener A callback function to be called when the event is received.
   * @param onError An optional callback function to be called when the subscription fails.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport({ url: "wss://rpc.hyperliquid.xyz/ws" }); // only `WebSocketTransport` supports this API
   * const client = new hl.ExplorerClient({ transport });
   *
   * const sub = await client.explorerBlock((data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  explorerBlock(
    this: ExplorerClient<ISubscriptionTransport>,
    listener: (data: ExplorerBlockEvent) => void,
    onError?: (error: WebSocketRequestError) => void,
  ): Promise<ISubscription> {
    return explorerBlock(this.config_, listener, onError);
  }

  /**
   * Subscribe to explorer transaction updates.
   *
   * @param listener A callback function to be called when the event is received.
   * @param onError An optional callback function to be called when the subscription fails.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport({ url: "wss://rpc.hyperliquid.xyz/ws" }); // only `WebSocketTransport` supports this API
   * const client = new hl.ExplorerClient({ transport });
   *
   * const sub = await client.explorerTxs((data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  explorerTxs(
    this: ExplorerClient<ISubscriptionTransport>,
    listener: (data: ExplorerTxsEvent) => void,
    onError?: (error: WebSocketRequestError) => void,
  ): Promise<ISubscription> {
    return explorerTxs(this.config_, listener, onError);
  }

  /**
   * Request transaction details by transaction hash.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Transaction details.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // only `HttpTransport` supports this API
   * const client = new hl.ExplorerClient({ transport });
   *
   * const data = await client.txDetails({ hash: "0x..." });
   * ```
   *
   * @see null
   */
  txDetails(
    this: ExplorerClient<IRequestTransport<"explorer">>,
    params: TxDetailsParameters,
    signal?: AbortSignal,
  ): Promise<TxDetailsResponse> {
    return txDetails(this.config_, params, signal);
  }

  /**
   * Request array of user transaction details.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of user transaction details.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // only `HttpTransport` supports this API
   * const client = new hl.ExplorerClient({ transport });
   *
   * const data = await client.userDetails({ user: "0x..." });
   * ```
   *
   * @see null
   */
  userDetails(
    this: ExplorerClient<IRequestTransport<"explorer">>,
    params: UserDetailsParameters,
    signal?: AbortSignal,
  ): Promise<UserDetailsResponse> {
    return userDetails(this.config_, params, signal);
  }
}

// ============================================================
// Type Re-exports
// ============================================================

export type { ExplorerConfig } from "./_methods/_base/mod.ts";

export type { BlockDetailsParameters, BlockDetailsResponse } from "./_methods/blockDetails.ts";
export type { ExplorerBlockEvent } from "./_methods/explorerBlock.ts";
export type { ExplorerTxsEvent } from "./_methods/explorerTxs.ts";
export type { TxDetailsParameters, TxDetailsResponse } from "./_methods/txDetails.ts";
export type { UserDetailsParameters, UserDetailsResponse } from "./_methods/userDetails.ts";
