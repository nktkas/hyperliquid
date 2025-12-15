import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, SignatureSchema, SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * This action does not do anything (no operation), but causes the nonce to be marked as used.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#invalidate-pending-nonce-noop
 */
export const NoopRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("noop"),
            v.description("Type of action."),
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
    v.description("This action does not do anything (no operation), but causes the nonce to be marked as used."),
  );
})();
export type NoopRequest = v.InferOutput<typeof NoopRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#invalidate-pending-nonce-noop
 */
export const NoopResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type NoopResponse = v.InferOutput<typeof NoopResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Request options for the {@linkcode noop} function. */
export type NoopOptions = ExtractRequestOptions<v.InferInput<typeof NoopRequest>>;

/** Successful variant of {@linkcode NoopResponse} without errors. */
export type NoopSuccessResponse = ExcludeErrorResponse<NoopResponse>;

/**
 * This action does not do anything (no operation), but causes the nonce to be marked as used.
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
 * import { noop } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await noop({ transport, wallet });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#invalidate-pending-nonce-noop
 */
export function noop(
  config: ExchangeConfig,
  opts?: NoopOptions,
): Promise<NoopSuccessResponse> {
  return executeL1Action(config, { type: "noop" }, opts);
}
