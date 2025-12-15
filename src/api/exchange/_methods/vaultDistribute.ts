import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, SignatureSchema, SuccessResponse } from "./_base/commonSchemas.ts";

/** Distribute funds from a vault between followers. */
export const VaultDistributeRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("vaultDistribute"),
            v.description("Type of action."),
          ),
          /** Vault address. */
          vaultAddress: v.pipe(
            Address,
            v.description("Vault address."),
          ),
          /**
           * Amount to distribute (float * 1e6).
           * Set to 0 to close the vault.
           */
          usd: v.pipe(
            UnsignedInteger,
            v.description(
              "Amount to distribute (float * 1e6)." +
                "\nSet to 0 to close the vault.",
            ),
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
      /** Expiration time of the action. */
      expiresAfter: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Expiration time of the action."),
      ),
    }),
    v.description("Distribute funds from a vault between followers."),
  );
})();
export type VaultDistributeRequest = v.InferOutput<typeof VaultDistributeRequest>;

/** Successful response without specific data or error response. */
export const VaultDistributeResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type VaultDistributeResponse = v.InferOutput<typeof VaultDistributeResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

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
 */
export function vaultDistribute(
  config: ExchangeConfig,
  params: VaultDistributeParameters,
  opts?: VaultDistributeOptions,
): Promise<VaultDistributeSuccessResponse> {
  const action = v.parse(VaultDistributeParameters, params);
  return executeL1Action(config, { type: "vaultDistribute", ...action }, opts);
}
