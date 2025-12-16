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
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("spotClearinghouseState"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** DEX name (empty string for main dex). */
      dex: v.pipe(
        v.optional(v.string()),
        v.description("DEX name (empty string for main dex)."),
      ),
    }),
    v.description("Request spot clearinghouse state."),
  );
})();
export type SpotClearinghouseStateRequest = v.InferOutput<typeof SpotClearinghouseStateRequest>;

/**
 * Account summary for spot trading.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
 */
export const SpotClearinghouseStateResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Array of available token balances. */
      balances: v.pipe(
        v.array(
          v.object({
            /** Asset symbol. */
            coin: v.pipe(
              v.string(),
              v.description("Asset symbol."),
            ),
            /** Unique identifier for the token. */
            token: v.pipe(
              UnsignedInteger,
              v.description("Unique identifier for the token."),
            ),
            /** Total balance. */
            total: v.pipe(
              UnsignedDecimal,
              v.description("Total balance."),
            ),
            /** Amount on hold. */
            hold: v.pipe(
              UnsignedDecimal,
              v.description("Amount on hold."),
            ),
            /** Entry notional value. */
            entryNtl: v.pipe(
              UnsignedDecimal,
              v.description("Entry notional value."),
            ),
          }),
        ),
        v.description("Array of available token balances."),
      ),
      /** Array of escrowed balances. */
      evmEscrows: v.pipe(
        v.optional(
          v.array(
            v.object({
              /** Asset symbol. */
              coin: v.pipe(
                v.string(),
                v.description("Asset symbol."),
              ),
              /** Unique identifier for the token. */
              token: v.pipe(
                UnsignedInteger,
                v.description("Unique identifier for the token."),
              ),
              /** Total balance. */
              total: v.pipe(
                UnsignedDecimal,
                v.description("Total balance."),
              ),
            }),
          ),
        ),
        v.description("Array of escrowed balances."),
      ),
    }),
    v.description("Account summary for spot trading."),
  );
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
