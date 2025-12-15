import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, SignatureSchema, SuccessResponse } from "./_base/commonSchemas.ts";

/** Modify a vault's configuration. */
export const VaultModifyRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("vaultModify"),
            v.description("Type of action."),
          ),
          /** Vault address. */
          vaultAddress: v.pipe(
            Address,
            v.description("Vault address."),
          ),
          /** Allow deposits from followers. */
          allowDeposits: v.pipe(
            v.nullish(v.boolean(), null),
            v.description("Allow deposits from followers."),
          ),
          /** Always close positions on withdrawal. */
          alwaysCloseOnWithdraw: v.pipe(
            v.nullish(v.boolean(), null),
            v.description("Always close positions on withdrawal."),
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
    v.description("Modify a vault's configuration."),
  );
})();
export type VaultModifyRequest = v.InferOutput<typeof VaultModifyRequest>;

/** Successful response without specific data or error response. */
export const VaultModifyResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type VaultModifyResponse = v.InferOutput<typeof VaultModifyResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const VaultModifyParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(VaultModifyRequest.entries.action.entries),
    ["type"],
  );
})();
/** Action parameters for the {@linkcode vaultModify} function. */
export type VaultModifyParameters = v.InferInput<typeof VaultModifyParameters>;

/** Request options for the {@linkcode vaultModify} function. */
export type VaultModifyOptions = ExtractRequestOptions<v.InferInput<typeof VaultModifyRequest>>;

/** Successful variant of {@linkcode VaultModifyResponse} without errors. */
export type VaultModifySuccessResponse = ExcludeErrorResponse<VaultModifyResponse>;

/**
 * Modify a vault's configuration.
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
 * import { vaultModify } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await vaultModify(
 *   { transport, wallet },
 *   {
 *     vaultAddress: "0x...",
 *     allowDeposits: true,
 *     alwaysCloseOnWithdraw: false,
 *   },
 * );
 * ```
 */
export function vaultModify(
  config: ExchangeConfig,
  params: VaultModifyParameters,
  opts?: VaultModifyOptions,
): Promise<VaultModifySuccessResponse> {
  const action = v.parse(VaultModifyParameters, params);
  return executeL1Action(config, { type: "vaultModify", ...action }, opts);
}
