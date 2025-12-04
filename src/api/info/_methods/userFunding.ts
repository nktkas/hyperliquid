import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Decimal, Hex, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request array of user funding ledger updates.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
 */
export const UserFundingRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("userFunding"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Start time (in ms since epoch). */
      startTime: v.pipe(
        UnsignedInteger,
        v.description("Start time (in ms since epoch)."),
      ),
      /** End time (in ms since epoch). */
      endTime: v.pipe(
        v.nullish(UnsignedInteger),
        v.description("End time (in ms since epoch)."),
      ),
    }),
    v.description("Request array of user funding ledger updates."),
  );
})();
export type UserFundingRequest = v.InferOutput<typeof UserFundingRequest>;

/**
 * Array of user funding ledger updates.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
 */
export const UserFundingResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** User funding ledger update. */
      v.pipe(
        v.object({
          /** Timestamp of the update (in ms since epoch). */
          time: v.pipe(
            UnsignedInteger,
            v.description("Timestamp of the update (in ms since epoch)."),
          ),
          /** L1 transaction hash. */
          hash: v.pipe(
            v.pipe(Hex, v.length(66)),
            v.description("L1 transaction hash."),
          ),
          /** Update details. */
          delta: v.pipe(
            v.object({
              /** Update type. */
              type: v.pipe(
                v.literal("funding"),
                v.description("Update type."),
              ),
              /** Asset symbol. */
              coin: v.pipe(
                v.string(),
                v.description("Asset symbol."),
              ),
              /** Amount transferred in USDC. */
              usdc: v.pipe(
                Decimal,
                v.description("Amount transferred in USDC."),
              ),
              /** Signed position size. */
              szi: v.pipe(
                Decimal,
                v.description("Signed position size."),
              ),
              /** Applied funding rate. */
              fundingRate: v.pipe(
                Decimal,
                v.description("Applied funding rate."),
              ),
              /** Number of samples. */
              nSamples: v.pipe(
                v.nullable(UnsignedInteger),
                v.description("Number of samples."),
              ),
            }),
            v.description("Update details."),
          ),
        }),
        v.description("User funding ledger update."),
      ),
    ),
    v.description("Array of user funding ledger updates."),
  );
})();
export type UserFundingResponse = v.InferOutput<typeof UserFundingResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_types.ts";

/** Request parameters for the {@linkcode userFunding} function. */
export type UserFundingParameters = Omit<v.InferInput<typeof UserFundingRequest>, "type">;

/**
 * Request array of user funding ledger updates.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
 *
 * @returns Array of user funding ledger updates.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userFunding } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await userFunding(
 *   { transport },
 *   { user: "0x...", startTime: Date.now() - 1000 * 60 * 60 * 24 },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
 */
export function userFunding(
  config: InfoConfig,
  params: UserFundingParameters,
  signal?: AbortSignal,
): Promise<UserFundingResponse> {
  const request = v.parse(UserFundingRequest, {
    type: "userFunding",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
