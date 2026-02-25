import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../../_schemas.ts";
import {
  type ErrorResponse,
  HyperliquidChainSchema,
  SignatureSchema,
  type SuccessResponse,
} from "./_base/commonSchemas.ts";

/**
 * Approve an agent to sign on behalf of the master account.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet
 */
export const ApproveAgentRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("approveAgent"),
      /** Chain ID in hex format for EIP-712 signing. */
      signatureChainId: Hex,
      /** HyperLiquid network type. */
      hyperliquidChain: HyperliquidChainSchema,
      /** Agent address. */
      agentAddress: Address,
      /** Agent name (min 1 and max 16 characters) or null for unnamed agent. */
      agentName: v.nullish(
        v.pipe(
          v.string(),
          v.check(
            (input) => {
              // Ignore trailing ` valid_until <timestamp>` when checking length
              const baseName = input.replace(/ valid_until \d+$/, "");
              return baseName.length >= 1 && baseName.length <= 16;
            },
            (issue) => {
              const baseName = issue.input.replace(/ valid_until \d+$/, "");
              return `Invalid length: Expected >= 1 and <= 16 but received ${baseName.length}`;
            },
          ),
        ),
        null,
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: UnsignedInteger,
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
  });
})();
export type ApproveAgentRequest = v.InferOutput<typeof ApproveAgentRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet
 */
export type ApproveAgentResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";

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
 * @param config General configuration for Exchange API requests.
 * @param params Parameters specific to the API request.
 * @param opts Request execution options.
 * @return Successful response without specific data.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example Basic usage
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { approveAgent } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await approveAgent(
 *   { transport, wallet },
 *   { agentAddress: "0x...", agentName: "myAgent" },
 * );
 * ```
 *
 * @example With expiration timestamp
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { approveAgent } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const expirationTimestamp = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
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
