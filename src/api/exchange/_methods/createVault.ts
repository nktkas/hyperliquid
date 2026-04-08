import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex, UnsignedInteger } from "../../_schemas.ts";

/**
 * Create a vault.
 * @see null
 */
export const CreateVaultRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("createVault"),
      /** Vault name. */
      name: v.pipe(v.string(), v.minLength(3), v.maxLength(50)),
      /** Vault description. */
      description: v.pipe(v.string(), v.minLength(10), v.maxLength(250)),
      /** Initial balance (float * 1e6). */
      initialUsd: v.pipe(UnsignedInteger, v.minValue(100 * 1e6)), // 100 USD
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
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
export type CreateVaultRequest = v.InferOutput<typeof CreateVaultRequest>;

/**
 * Response for creating a vault.
 * @see null
 */
export type CreateVaultResponse = {
  /** Successful status. */
  status: "ok";
  /** Response details. */
  response: {
    /** Type of response. */
    type: "createVault";
    /**
     * Vault address.
     * @pattern ^0x[a-fA-F0-9]{40}$
     */
    data: `0x${string}`;
  };
} | {
  /** Error status. */
  status: "err";
  /** Error message. */
  response: string;
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for action fields (excludes request-level system fields). */
const CreateVaultActionSchema = /* @__PURE__ */ (() => {
  return v.object(CreateVaultRequest.entries.action.entries);
})();

/** Action parameters for the {@linkcode createVault} function. */
export type CreateVaultParameters = Omit<v.InferInput<typeof CreateVaultActionSchema>, "type">;

/** Request options for the {@linkcode createVault} function. */
export type CreateVaultOptions = ExtractRequestOptions<v.InferInput<typeof CreateVaultRequest>>;

/** Successful variant of {@linkcode CreateVaultResponse} without errors. */
export type CreateVaultSuccessResponse = ExcludeErrorResponse<CreateVaultResponse>;

/**
 * Create a vault.
 *
 * Signing: L1 Action.
 *
 * @param config General configuration for Exchange API requests.
 * @param params Parameters specific to the API request.
 * @param opts Request execution options.
 * @return Response for creating a vault.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
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
 * const data = await createVault({ transport, wallet }, {
 *   name: "...",
 *   description: "...",
 *   initialUsd: 100 * 1e6,
 *   nonce: Date.now(),
 * });
 * ```
 *
 * @see null
 */
export function createVault(
  config: ExchangeConfig,
  params: CreateVaultParameters,
  opts?: CreateVaultOptions,
): Promise<CreateVaultSuccessResponse> {
  const action = parse(CreateVaultActionSchema, { type: "createVault", ...params });
  return executeL1Action(config, action, opts);
}
