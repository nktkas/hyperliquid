import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, SignatureSchema, SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Enable HIP-3 DEX abstraction.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#enable-hip-3-dex-abstraction-agent
 */
export const AgentEnableDexAbstractionRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("agentEnableDexAbstraction"),
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type AgentEnableDexAbstractionRequest = v.InferOutput<typeof AgentEnableDexAbstractionRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#enable-hip-3-dex-abstraction-agent
 */
export const AgentEnableDexAbstractionResponse = /* @__PURE__ */ (() => {
  return v.union([SuccessResponse, ErrorResponse]);
})();
export type AgentEnableDexAbstractionResponse = v.InferOutput<typeof AgentEnableDexAbstractionResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Request options for the {@linkcode agentEnableDexAbstraction} function. */
export type AgentEnableDexAbstractionOptions = ExtractRequestOptions<
  v.InferInput<typeof AgentEnableDexAbstractionRequest>
>;

/** Successful variant of {@linkcode AgentEnableDexAbstractionResponse} without errors. */
export type AgentEnableDexAbstractionSuccessResponse = ExcludeErrorResponse<AgentEnableDexAbstractionResponse>;

/**
 * Enable HIP-3 DEX abstraction.
 *
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 *
 * @returns Successful response without specific data.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { agentEnableDexAbstraction } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await agentEnableDexAbstraction({ transport, wallet });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#enable-hip-3-dex-abstraction-agent
 */
export function agentEnableDexAbstraction(
  config: ExchangeConfig,
  opts?: AgentEnableDexAbstractionOptions,
): Promise<AgentEnableDexAbstractionSuccessResponse> {
  return executeL1Action(config, { type: "agentEnableDexAbstraction" }, opts);
}
