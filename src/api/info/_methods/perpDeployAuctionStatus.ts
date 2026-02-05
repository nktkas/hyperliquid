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
  return v.object({
    /** Type of request. */
    type: v.literal("perpDeployAuctionStatus"),
  });
})();
export type PerpDeployAuctionStatusRequest = v.InferOutput<typeof PerpDeployAuctionStatusRequest>;

/**
 * Status of the perpetual deploy auction.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-information-about-the-perp-deploy-auction
 */
export const PerpDeployAuctionStatusResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** Current gas. */
    currentGas: v.nullable(UnsignedDecimal),
    /** Duration in seconds. */
    durationSeconds: UnsignedInteger,
    /** Ending gas. */
    endGas: v.nullable(UnsignedDecimal),
    /** Starting gas. */
    startGas: UnsignedDecimal,
    /** Auction start time (seconds since epoch). */
    startTimeSeconds: UnsignedInteger,
  });
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
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
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
