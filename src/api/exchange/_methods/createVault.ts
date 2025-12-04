import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, Nonce, Signature } from "./_base/schemas.ts";

/** Create a vault. */
export const CreateVaultRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("createVault"),
            v.description("Type of action."),
          ),
          /** Vault name. */
          name: v.pipe(
            v.string(),
            v.minLength(3),
            v.description("Vault name."),
          ),
          /** Vault description. */
          description: v.pipe(
            v.string(),
            v.minLength(10),
            v.description("Vault description."),
          ),
          /** Initial balance (float * 1e6). */
          initialUsd: v.pipe(
            UnsignedInteger,
            v.minValue(100000000), // 100 USDC
            v.description("Initial balance (float * 1e6)."),
          ),
          /** Nonce (timestamp in ms) used to prevent replay attacks. */
          nonce: Nonce,
        }),
        v.description("Action to perform."),
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: Nonce,
      /** ECDSA signature components. */
      signature: Signature,
      /** Expiration time of the action. */
      expiresAfter: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Expiration time of the action."),
      ),
    }),
    v.description("Create a vault."),
  );
})();
export type CreateVaultRequest = v.InferOutput<typeof CreateVaultRequest>;

/** Response for creating a vault. */
export const CreateVaultResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([
      v.pipe(
        v.object({
          /** Successful status. */
          status: v.pipe(
            v.literal("ok"),
            v.description("Successful status."),
          ),
          /** Response details. */
          response: v.pipe(
            v.object({
              /** Type of response. */
              type: v.pipe(
                v.literal("createVault"),
                v.description("Type of response."),
              ),
              /** Vault address. */
              data: v.pipe(
                Address,
                v.description("Vault address."),
              ),
            }),
            v.description("Response details."),
          ),
        }),
        v.description("Successful response for creating a vault"),
      ),
      ErrorResponse,
    ]),
    v.description("Response for creating a vault."),
  );
})();
export type CreateVaultResponse = v.InferOutput<typeof CreateVaultResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const CreateVaultParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(CreateVaultRequest.entries.action.entries),
    ["type"],
  );
})();
/** Action parameters for the {@linkcode createVault} function. */
export type CreateVaultParameters = v.InferInput<typeof CreateVaultParameters>;

/** Request options for the {@linkcode createVault} function. */
export type CreateVaultOptions = ExtractRequestOptions<v.InferInput<typeof CreateVaultRequest>>;

/** Successful variant of {@linkcode CreateVaultResponse} without errors. */
export type CreateVaultSuccessResponse = ExcludeErrorResponse<CreateVaultResponse>;

/**
 * Create a vault.
 *
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 *
 * @returns Response for creating a vault.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { createVault } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await createVault(
 *   { transport, wallet },
 *   {
 *     name: "...",
 *     description: "...",
 *     initialUsd: 100 * 1e6,
 *     nonce: Date.now(),
 *   },
 * );
 * ```
 */
export function createVault(
  config: ExchangeConfig,
  params: CreateVaultParameters,
  opts?: CreateVaultOptions,
): Promise<CreateVaultSuccessResponse> {
  const action = v.parse(CreateVaultParameters, params);
  return executeL1Action(config, { type: "createVault", ...action }, opts);
}
