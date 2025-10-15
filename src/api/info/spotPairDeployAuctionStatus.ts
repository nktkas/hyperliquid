import * as v from "valibot";
import { parser, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

// -------------------- Schemas --------------------

/**
 * Request for the status of the spot deploy auction.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-pair-deploy-auction
 */
export const SpotPairDeployAuctionStatusRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("spotPairDeployAuctionStatus"),
        v.description("Type of request."),
      ),
    }),
    v.description("Request for the status of the spot deploy auction."),
  );
})();
export type SpotPairDeployAuctionStatusRequest = v.InferOutput<typeof SpotPairDeployAuctionStatusRequest>;

/**
 * Status of the spot deploy auction.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-pair-deploy-auction
 */
export const SpotPairDeployAuctionStatusResponse = /* @__PURE__ */ (() => {
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
    v.description("Status of the spot deploy auction."),
  );
})();
export type SpotPairDeployAuctionStatusResponse = v.InferOutput<typeof SpotPairDeployAuctionStatusResponse>;

// -------------------- Function --------------------

/**
 * Request for the status of the spot deploy auction.
 * @param config - General configuration for Info API requests.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Status of the spot deploy auction.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-pair-deploy-auction
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { spotPairDeployAuctionStatus } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await spotPairDeployAuctionStatus({ transport });
 * ```
 */
export function spotPairDeployAuctionStatus(
  config: InfoRequestConfig,
  signal?: AbortSignal,
): Promise<SpotPairDeployAuctionStatusResponse> {
  const request = parser(SpotPairDeployAuctionStatusRequest)({
    type: "spotPairDeployAuctionStatus",
  });
  return config.transport.request("info", request, signal);
}
