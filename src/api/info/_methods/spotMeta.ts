import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, Integer, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request spot trading metadata.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata
 */
export const SpotMetaRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("spotMeta"),
  });
})();
export type SpotMetaRequest = v.InferOutput<typeof SpotMetaRequest>;

/**
 * Metadata for spot assets.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata
 */
export const SpotMetaResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** Trading universes available for spot trading. */
    universe: v.array(
      v.object({
        /** Token indices included in this universe. */
        tokens: v.array(UnsignedInteger),
        /** Name of the universe. */
        name: v.string(),
        /** Unique identifier of the universe. */
        index: UnsignedInteger,
        /** Indicates if the token is the primary representation in the system. */
        isCanonical: v.boolean(),
      }),
    ),
    /** Tokens available for spot trading. */
    tokens: v.array(
      v.object({
        /** Name of the token. */
        name: v.string(),
        /** Minimum decimal places for order sizes. */
        szDecimals: UnsignedInteger,
        /** Number of decimals for the token's smallest unit. */
        weiDecimals: UnsignedInteger,
        /** Unique identifier for the token. */
        index: UnsignedInteger,
        /** Token ID. */
        tokenId: Hex,
        /** Indicates if the token is the primary representation in the system. */
        isCanonical: v.boolean(),
        /** EVM contract details. */
        evmContract: v.nullable(
          v.object({
            /** Contract address. */
            address: Address,
            /** Extra decimals in the token's smallest unit. */
            evm_extra_wei_decimals: Integer,
          }),
        ),
        /** Full display name of the token. */
        fullName: v.nullable(v.string()),
        /** Deployer trading fee share for the token. */
        deployerTradingFeeShare: UnsignedDecimal,
      }),
    ),
    /** Outcome markets available for spot trading. */
    outcomes: v.array(
      v.object({
        /** Unique identifier of the outcome market. */
        outcome: UnsignedInteger,
        /** Short name of the outcome market. */
        name: v.string(),
        /** Description of the outcome market. */
        description: v.string(),
        /** Token specifications for each side of the outcome market. */
        sideSpecs: v.array(
          v.object({
            /** Side name (e.g., "YES", "NO"). */
            name: v.string(),
            /** Spot token index corresponding to this side. */
            token: UnsignedInteger,
          }),
        ),
      }),
    ),
    /** Questions for prediction markets. */
    questions: v.array(
      v.object({
        /** Unique identifier of the question. */
        question: UnsignedInteger,
        /** Short name of the question. */
        name: v.string(),
        /** Description of the question. */
        description: v.string(),
        /** Default outcome index if the question is not resolved. */
        fallbackOutcome: UnsignedInteger,
        /** Outcome indices associated with this question. */
        namedOutcomes: v.array(UnsignedInteger),
      }),
    ),
  });
})();
export type SpotMetaResponse = v.InferOutput<typeof SpotMetaResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request spot trading metadata.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Metadata for spot assets.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { spotMeta } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await spotMeta({ transport });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata
 */
export function spotMeta(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<SpotMetaResponse> {
  const request = v.parse(SpotMetaRequest, {
    type: "spotMeta",
  });
  return config.transport.request("info", request, signal);
}
