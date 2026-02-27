import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { type ErrorResponse, SignatureSchema, type SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Distribute funds from a vault between followers.
 * @see null
 */
export const VaultDistributeRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("vaultDistribute"),
      /** Vault address. */
      vaultAddress: Address,
      /**
       * Amount to distribute (float * 1e6).
       * Set to 0 to close the vault.
       */
      usd: UnsignedInteger,
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type VaultDistributeRequest = v.InferOutput<typeof VaultDistributeRequest>;

/**
 * Successful response without specific data or error response.
 * @see null
 */
export type VaultDistributeResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const VaultDistributeParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(VaultDistributeRequest.entries.action.entries),
    ["type"],
  );
})();

/** Action parameters for the {@linkcode vaultDistribute} function. */
export type VaultDistributeParameters = v.InferInput<typeof VaultDistributeParameters>;

/** Request options for the {@linkcode vaultDistribute} function. */
export type VaultDistributeOptions = ExtractRequestOptions<v.InferInput<typeof VaultDistributeRequest>>;

/** Successful variant of {@linkcode VaultDistributeResponse} without errors. */
export type VaultDistributeSuccessResponse = ExcludeErrorResponse<VaultDistributeResponse>;

/**
 * Distribute funds from a vault between followers.
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
 * import { vaultDistribute } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await vaultDistribute(
 *   { transport, wallet },
 *   { vaultAddress: "0x...", usd: 10 * 1e6 },
 * );
 * ```
 *
 * @see null
 */
export function vaultDistribute(
  config: ExchangeConfig,
  params: VaultDistributeParameters,
  opts?: VaultDistributeOptions,
): Promise<VaultDistributeSuccessResponse> {
  const action = parse(VaultDistributeParameters, params);
  return executeL1Action(config, { type: "vaultDistribute", ...action }, opts);
}
