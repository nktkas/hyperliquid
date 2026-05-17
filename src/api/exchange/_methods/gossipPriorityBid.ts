import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex, UnsignedInteger } from "../../_schemas.ts";

/**
 * Bid in a gossip priority Dutch auction to receive prioritized mempool data for an IP.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/priority-fees
 */
export const GossipPriorityBidRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("gossipPriorityBid"),
      /** Auction slot identifier (`0` or `1`). Lower-indexed slots are strictly prioritized over higher ones. */
      slotId: v.pipe(UnsignedInteger, v.maxValue(1)),
      /** IP address (IPv4 or IPv6) that should be prioritized. Any address may bid on behalf of any IP. */
      ip: v.pipe(v.string(), v.ip()),
      /** Max gas in wei (`1 HYPE = 10^8 wei`) charged from spot balance. Min auction price is `0.1 HYPE`. */
      maxGas: UnsignedInteger,
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: v.object({
      /** First 32-byte component. */
      r: v.pipe(Hex, v.length(66)),
      /** Second 32-byte component. */
      s: v.pipe(Hex, v.length(66)),
      /** Recovery identifier. */
      v: v.picklist([27, 28]),
    }),
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type GossipPriorityBidRequest = v.InferOutput<typeof GossipPriorityBidRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/priority-fees
 */
export type GossipPriorityBidResponse =
  | {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
      /** Type of response. */
      type: "default";
    };
  }
  | {
    /** Error status. */
    status: "err";
    /** Error message. */
    response: string;
  };

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import { canonicalize } from "../../../signing/mod.ts";
import {
  type ExchangeConfig,
  type ExcludeErrorResponse,
  executeL1Action,
  type ExtractRequestOptions,
} from "./_base/mod.ts";

/** Schema for action fields (excludes request-level system fields). */
const GossipPriorityBidActionSchema = /* @__PURE__ */ (() => {
  return v.object(GossipPriorityBidRequest.entries.action.entries);
})();

/** Action parameters for the {@linkcode gossipPriorityBid} function. */
export type GossipPriorityBidParameters = Omit<v.InferInput<typeof GossipPriorityBidActionSchema>, "type">;

/** Request options for the {@linkcode gossipPriorityBid} function. */
export type GossipPriorityBidOptions = ExtractRequestOptions<v.InferInput<typeof GossipPriorityBidRequest>>;

/** Successful variant of {@linkcode GossipPriorityBidResponse} without errors. */
export type GossipPriorityBidSuccessResponse = ExcludeErrorResponse<GossipPriorityBidResponse>;

/**
 * Bid in a gossip priority Dutch auction to receive prioritized mempool data for an IP.
 *
 * Signing: L1 Action.
 *
 * @param config General configuration for Exchange API requests.
 * @param params Parameters specific to the API request.
 * @param opts Request execution options.
 * @return Successful response without specific data.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { gossipPriorityBid } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await gossipPriorityBid({ transport, wallet }, {
 *   slotId: 0,
 *   ip: "1.2.3.4",
 *   maxGas: 100_000_000, // 1 HYPE
 * });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/priority-fees
 */
export function gossipPriorityBid(
  config: ExchangeConfig,
  params: GossipPriorityBidParameters,
  opts?: GossipPriorityBidOptions,
): Promise<GossipPriorityBidSuccessResponse> {
  const action = canonicalize(
    GossipPriorityBidActionSchema,
    parse(GossipPriorityBidActionSchema, { type: "gossipPriorityBid", ...params }),
  );
  return executeL1Action(config, action, opts);
}
