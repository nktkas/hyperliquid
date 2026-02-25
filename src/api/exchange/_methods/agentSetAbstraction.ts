import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";
import { type ErrorResponse, SignatureSchema, type SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Set User abstraction mode (method for agent wallet).
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#set-user-abstraction-agent
 */
export const AgentSetAbstractionRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("agentSetAbstraction"),
      /**
       * User abstraction mode.
       * - `"i"`: disabled
       * - `"u"`: unifiedAccount
       * - `"p"`: portfolioMargin
       */
      abstraction: v.picklist(["i", "u", "p"]),
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type AgentSetAbstractionRequest = v.InferOutput<typeof AgentSetAbstractionRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#set-user-abstraction-agent
 */
export type AgentSetAbstractionResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const AgentSetAbstractionParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(AgentSetAbstractionRequest.entries.action.entries),
    ["type"],
  );
})();

/** Action parameters for the {@linkcode agentSetAbstraction} function. */
export type AgentSetAbstractionParameters = v.InferInput<typeof AgentSetAbstractionParameters>;

/** Request options for the {@linkcode agentSetAbstraction} function. */
export type AgentSetAbstractionOptions = ExtractRequestOptions<
  v.InferInput<typeof AgentSetAbstractionRequest>
>;

/** Successful variant of {@linkcode AgentSetAbstractionResponse} without errors. */
export type AgentSetAbstractionSuccessResponse = ExcludeErrorResponse<AgentSetAbstractionResponse>;

/**
 * Set User abstraction mode (method for agent wallet).
 *
 * @param config General configuration for Exchange API requests.
 * @param params Parameters specific to the API request.
 * @param opts Request execution options.
 * @return Successful response without specific data.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { agentSetAbstraction } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await agentSetAbstraction(
 *   { transport, wallet },
 *   { abstraction: "u" },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#set-user-abstraction-agent
 */
export function agentSetAbstraction(
  config: ExchangeConfig,
  params: AgentSetAbstractionParameters,
  opts?: AgentSetAbstractionOptions,
): Promise<AgentSetAbstractionSuccessResponse> {
  const action = v.parse(AgentSetAbstractionParameters, params);
  return executeL1Action(config, { type: "agentSetAbstraction", ...action }, opts);
}
