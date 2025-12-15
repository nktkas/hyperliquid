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
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("spotMeta"),
        v.description("Type of request."),
      ),
    }),
    v.description("Request spot trading metadata."),
  );
})();
export type SpotMetaRequest = v.InferOutput<typeof SpotMetaRequest>;

/**
 * Metadata for spot assets.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata
 */
export const SpotMetaResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Trading universes available for spot trading. */
      universe: v.pipe(
        v.array(
          v.object({
            /** Token indices included in this universe. */
            tokens: v.pipe(
              v.array(UnsignedInteger),
              v.description("Token indices included in this universe."),
            ),
            /** Name of the universe. */
            name: v.pipe(
              v.string(),
              v.description("Name of the universe."),
            ),
            /** Unique identifier of the universe. */
            index: v.pipe(
              UnsignedInteger,
              v.description("Unique identifier of the universe."),
            ),
            /** Indicates if the token is the primary representation in the system. */
            isCanonical: v.pipe(
              v.boolean(),
              v.description("Indicates if the token is the primary representation in the system."),
            ),
          }),
        ),
        v.description("Trading universes available for spot trading."),
      ),
      /** Tokens available for spot trading. */
      tokens: v.pipe(
        v.array(
          v.object({
            /** Name of the token. */
            name: v.pipe(
              v.string(),
              v.description("Name of the token."),
            ),
            /** Minimum decimal places for order sizes. */
            szDecimals: v.pipe(
              UnsignedInteger,
              v.description("Minimum decimal places for order sizes."),
            ),
            /** Number of decimals for the token's smallest unit. */
            weiDecimals: v.pipe(
              UnsignedInteger,
              v.description("Number of decimals for the token's smallest unit."),
            ),
            /** Unique identifier for the token. */
            index: v.pipe(
              UnsignedInteger,
              v.description("Unique identifier for the token."),
            ),
            /** Token ID. */
            tokenId: v.pipe(
              Hex,
              v.description("Token ID."),
            ),
            /** Indicates if the token is the primary representation in the system. */
            isCanonical: v.pipe(
              v.boolean(),
              v.description("Indicates if the token is the primary representation in the system."),
            ),
            /** EVM contract details. */
            evmContract: v.pipe(
              v.nullable(
                v.object({
                  /** Contract address. */
                  address: v.pipe(
                    Address,
                    v.description("Contract address."),
                  ),
                  /** Extra decimals in the token's smallest unit. */
                  evm_extra_wei_decimals: v.pipe(
                    Integer,
                    v.description("Extra decimals in the token's smallest unit."),
                  ),
                }),
              ),
              v.description("EVM contract details."),
            ),
            /** Full display name of the token. */
            fullName: v.pipe(
              v.nullable(v.string()),
              v.description("Full display name of the token."),
            ),
            /** Deployer trading fee share for the token. */
            deployerTradingFeeShare: v.pipe(
              UnsignedDecimal,
              v.description("Deployer trading fee share for the token."),
            ),
          }),
        ),
        v.description("Tokens available for spot trading."),
      ),
    }),
    v.description("Metadata for spot assets."),
  );
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
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
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
