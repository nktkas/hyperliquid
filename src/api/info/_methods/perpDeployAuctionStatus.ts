import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request for the status of the perpetual deploy auction.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-information-about-the-perp-deploy-auction
 */
export const PerpDeployAuctionStatusRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("perpDeployAuctionStatus"),
        v.description("Type of request."),
      ),
    }),
    v.description("Request for the status of the perpetual deploy auction."),
  );
})();
export type PerpDeployAuctionStatusRequest = v.InferOutput<typeof PerpDeployAuctionStatusRequest>;

/**
 * Status of the perpetual deploy auction.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-information-about-the-perp-deploy-auction
 */
export const PerpDeployAuctionStatusResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Current gas. */
      currentGas: v.pipe(
        v.nullable(UnsignedDecimal),
        v.description("Current gas."),
      ),
      /** Duration in seconds. */
      durationSeconds: v.pipe(
        UnsignedInteger,
        v.description("Duration in seconds."),
      ),
      /** Ending gas. */
      endGas: v.pipe(
        v.nullable(UnsignedDecimal),
        v.description("Ending gas."),
      ),
      /** Starting gas. */
      startGas: v.pipe(
        UnsignedDecimal,
        v.description("Starting gas."),
      ),
      /** Auction start time (seconds since epoch). */
      startTimeSeconds: v.pipe(
        UnsignedInteger,
        v.description("Auction start time (seconds since epoch)."),
      ),
    }),
    v.description("Status of the perpetual deploy auction."),
  );
})();
export type PerpDeployAuctionStatusResponse = v.InferOutput<typeof PerpDeployAuctionStatusResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request for the status of the perpetual deploy auction.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
 *
 * @returns Status of the perpetual deploy auction.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { perpDeployAuctionStatus } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await perpDeployAuctionStatus({ transport });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-information-about-the-perp-deploy-auction
 */
export function perpDeployAuctionStatus(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<PerpDeployAuctionStatusResponse> {
  const request = v.parse(PerpDeployAuctionStatusRequest, {
    type: "perpDeployAuctionStatus",
  });
  return config.transport.request("info", request, signal);
}
