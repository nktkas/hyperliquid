import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { PerpDeployAuctionStatusResponse } from "./perpDeployAuctionStatus.ts";

/**
 * Request for the status of the spot deploy auction.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-pair-deploy-auction
 */
export const SpotPairDeployAuctionStatusRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("spotPairDeployAuctionStatus"),
  });
})();
export type SpotPairDeployAuctionStatusRequest = v.InferOutput<typeof SpotPairDeployAuctionStatusRequest>;

/**
 * Status of the spot deploy auction.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-pair-deploy-auction
 */
export const SpotPairDeployAuctionStatusResponse = /* @__PURE__ */ (() => {
  return PerpDeployAuctionStatusResponse;
})();
export type SpotPairDeployAuctionStatusResponse = v.InferOutput<typeof SpotPairDeployAuctionStatusResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request for the status of the spot deploy auction.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Status of the spot deploy auction.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { spotPairDeployAuctionStatus } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await spotPairDeployAuctionStatus({ transport });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-pair-deploy-auction
 */
export function spotPairDeployAuctionStatus(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<SpotPairDeployAuctionStatusResponse> {
  const request = v.parse(SpotPairDeployAuctionStatusRequest, {
    type: "spotPairDeployAuctionStatus",
  });
  return config.transport.request("info", request, signal);
}
