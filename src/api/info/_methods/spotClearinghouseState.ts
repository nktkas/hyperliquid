import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request spot clearinghouse state.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
 */
export const SpotClearinghouseStateRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("spotClearinghouseState"),
    /** User address. */
    user: Address,
    /** DEX name (empty string for main dex). */
    dex: v.optional(v.string()),
  });
})();
export type SpotClearinghouseStateRequest = v.InferOutput<typeof SpotClearinghouseStateRequest>;

/**
 * Account summary for spot trading.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
 */
export const SpotClearinghouseStateResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** Array of available token balances. */
    balances: v.array(
      v.object({
        /** Asset symbol. */
        coin: v.string(),
        /** Unique identifier for the token. */
        token: UnsignedInteger,
        /** Total balance. */
        total: UnsignedDecimal,
        /** Amount on hold. */
        hold: UnsignedDecimal,
        /** Entry notional value. */
        entryNtl: UnsignedDecimal,
      }),
    ),
    /** Array of escrowed balances. */
    evmEscrows: v.optional(
      v.array(
        v.object({
          /** Asset symbol. */
          coin: v.string(),
          /** Unique identifier for the token. */
          token: UnsignedInteger,
          /** Total balance. */
          total: UnsignedDecimal,
        }),
      ),
    ),
  });
})();
export type SpotClearinghouseStateResponse = v.InferOutput<typeof SpotClearinghouseStateResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode spotClearinghouseState} function. */
export type SpotClearinghouseStateParameters = Omit<v.InferInput<typeof SpotClearinghouseStateRequest>, "type">;

/**
 * Request spot clearinghouse state.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Account summary for spot trading.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { spotClearinghouseState } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await spotClearinghouseState(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
 */
export function spotClearinghouseState(
  config: InfoConfig,
  params: SpotClearinghouseStateParameters,
  signal?: AbortSignal,
): Promise<SpotClearinghouseStateResponse> {
  const request = v.parse(SpotClearinghouseStateRequest, {
    type: "spotClearinghouseState",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
