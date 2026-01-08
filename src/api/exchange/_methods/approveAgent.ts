import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, HyperliquidChainSchema, SignatureSchema, SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Approve an agent to sign on behalf of the master account.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet
 */
export const ApproveAgentRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("approveAgent"),
            v.description("Type of action."),
          ),
          /** Chain ID in hex format for EIP-712 signing. */
          signatureChainId: v.pipe(
            Hex,
            v.description("Chain ID in hex format for EIP-712 signing."),
          ),
          /** HyperLiquid network type. */
          hyperliquidChain: v.pipe(
            HyperliquidChainSchema,
            v.description("HyperLiquid network type."),
          ),
          /** Agent address. */
          agentAddress: v.pipe(
            Address,
            v.description("Agent address."),
          ),
          /** Agent name or null for unnamed agent. */
          agentName: v.pipe(
            v.nullish(
              v.pipe(
                v.string(),
                v.minLength(1),
              ),
              null,
            ),
            v.description("Agent name or null for unnamed agent."),
          ),
          /** Nonce (timestamp in ms) used to prevent replay attacks. */
          nonce: v.pipe(
            UnsignedInteger,
            v.description("Nonce (timestamp in ms) used to prevent replay attacks."),
          ),
        }),
        v.description("Action to perform."),
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: v.pipe(
        UnsignedInteger,
        v.description("Nonce (timestamp in ms) used to prevent replay attacks."),
      ),
      /** ECDSA signature components. */
      signature: v.pipe(
        SignatureSchema,
        v.description("ECDSA signature components."),
      ),
    }),
    v.description("Approve an agent to sign on behalf of the master account."),
  );
})();
export type ApproveAgentRequest = v.InferOutput<typeof ApproveAgentRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet
 */
export const ApproveAgentResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type ApproveAgentResponse = v.InferOutput<typeof ApproveAgentResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const ApproveAgentParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(ApproveAgentRequest.entries.action.entries),
    ["type", "signatureChainId", "hyperliquidChain", "nonce"],
  );
})();
/** Action parameters for the {@linkcode approveAgent} function. */
export type ApproveAgentParameters = v.InferInput<typeof ApproveAgentParameters>;

/** Request options for the {@linkcode approveAgent} function. */
export type ApproveAgentOptions = ExtractRequestOptions<v.InferInput<typeof ApproveAgentRequest>>;

/** Successful variant of {@linkcode ApproveAgentResponse} without errors. */
export type ApproveAgentSuccessResponse = ExcludeErrorResponse<ApproveAgentResponse>;

/** EIP-712 types for the {@linkcode approveAgent} function. */
export const ApproveAgentTypes = {
  "HyperliquidTransaction:ApproveAgent": [
    { name: "hyperliquidChain", type: "string" },
    { name: "agentAddress", type: "address" },
    { name: "agentName", type: "string" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Approve an agent to sign on behalf of the master account.
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
 * import { approveAgent } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * // Basic usage with agent name only
 * await approveAgent(
 *   { transport, wallet },
 *   { agentAddress: "0x...", agentName: "myAgent" },
 * );
 *
 * // With expiration timestamp
 * const expirationTimestamp = Date.now() + 24 * 60 * 60 * 1000;
 * await approveAgent(
 *   { transport, wallet },
 *   {
 *     agentAddress: "0x...",
 *     agentName: `myAgent valid_until ${expirationTimestamp}`,
 *   },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet
 */
export function approveAgent(
  config: ExchangeConfig,
  params: ApproveAgentParameters,
  opts?: ApproveAgentOptions,
): Promise<ApproveAgentSuccessResponse> {
  const action = v.parse(ApproveAgentParameters, params);
  return executeUserSignedAction(
    config,
    { type: "approveAgent", ...action },
    ApproveAgentTypes,
    opts,
  );
}
