import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Transfer tokens on behalf of the principal via an agent wallet.
 *
 * Like {@link sendAsset} but signed as an L1 action by the agent wallet (instead of EIP-712 by the principal).
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#agent-send-asset
 */
export const AgentSendAssetRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("agentSendAsset"),
      /** Destination address. */
      destination: Address,
      /** Source DEX ("" for default USDC perp DEX, "spot" for spot). */
      sourceDex: v.string(),
      /** Destination DEX ("" for default USDC perp DEX, "spot" for spot). */
      destinationDex: v.string(),
      /** Token identifier. */
      token: v.string(),
      /** Amount to send (not in wei). */
      amount: UnsignedDecimal,
      /** Source sub-account address ("" for main account). */
      fromSubAccount: v.optional(
        v.union([v.literal(""), Address]),
        "",
      ),
      /** Nonce (timestamp in ms). Equal to the envelope nonce; injected by the SDK. */
      nonce: UnsignedInteger,
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
export type AgentSendAssetRequest = v.InferOutput<typeof AgentSendAssetRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#agent-send-asset
 */
export type AgentSendAssetResponse =
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
import { globalNonceManager } from "./_base/_nonce.ts";

/** Schema for action fields (excludes request-level system fields). */
const AgentSendAssetActionSchema = /* @__PURE__ */ (() => {
  return v.object(AgentSendAssetRequest.entries.action.entries);
})();

/** Action parameters for the {@linkcode agentSendAsset} function. */
export type AgentSendAssetParameters = Omit<v.InferInput<typeof AgentSendAssetActionSchema>, "type" | "nonce">;

/** Request options for the {@linkcode agentSendAsset} function. */
export type AgentSendAssetOptions = ExtractRequestOptions<v.InferInput<typeof AgentSendAssetRequest>>;

/** Successful variant of {@linkcode AgentSendAssetResponse} without errors. */
export type AgentSendAssetSuccessResponse = ExcludeErrorResponse<AgentSendAssetResponse>;

/**
 * Transfer tokens on behalf of the principal via an agent wallet.
 *
 * Like {@link sendAsset} but signed as an L1 action by the agent wallet (instead of EIP-712 by the principal).
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
 * import { agentSendAsset } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const agentWallet = privateKeyToAccount("0x..."); // approved agent's private key
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await agentSendAsset({ transport, wallet: agentWallet }, {
 *   destination: "0x0000000000000000000000000000000000000001",
 *   sourceDex: "",
 *   destinationDex: "test",
 *   token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
 *   amount: "1",
 * });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#agent-send-asset
 */
export function agentSendAsset(
  config: ExchangeConfig,
  params: AgentSendAssetParameters,
  opts?: AgentSendAssetOptions,
): Promise<AgentSendAssetSuccessResponse> {
  const action = canonicalize(
    AgentSendAssetActionSchema,
    parse(AgentSendAssetActionSchema, { type: "agentSendAsset", ...params, nonce: 0 }),
  );
  return executeL1Action(
    {
      ...config,
      nonceManager: async (addr) =>
        // Patch action.nonce in-place so the body matches the envelope nonce (server requires equality).
        action.nonce =
          await (config.nonceManager?.(addr) ?? globalNonceManager.getNonce(`${addr}:${config.transport.isTestnet}`)),
    },
    action,
    opts,
  );
}
