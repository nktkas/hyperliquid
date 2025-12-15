import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { SignatureSchema } from "./_base/commonSchemas.ts";

/**
 * Cancel order(s).
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
 */
export const CancelRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("cancel"),
            v.description("Type of action."),
          ),
          /** Orders to cancel by asset and order ID. */
          cancels: v.pipe(
            v.array(
              v.object({
                /** Asset ID. */
                a: v.pipe(
                  UnsignedInteger,
                  v.description("Asset ID."),
                ),
                /** Order ID. */
                o: v.pipe(
                  UnsignedInteger,
                  v.description("Order ID."),
                ),
              }),
            ),
            v.description("Orders to cancel by asset and order ID."),
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
      /** Vault address (for vault trading). */
      vaultAddress: v.pipe(
        v.optional(Address),
        v.description("Vault address (for vault trading)."),
      ),
      /** Expiration time of the action. */
      expiresAfter: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Expiration time of the action."),
      ),
    }),
    v.description("Cancel order(s)."),
  );
})();
export type CancelRequest = v.InferOutput<typeof CancelRequest>;

/**
 * Response for order cancellation.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
 */
export const CancelResponse = /* @__PURE__ */ (() => {
  return v.pipe(
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
            v.literal("cancel"),
            v.description("Type of response."),
          ),
          /** Specific data. */
          data: v.pipe(
            v.object({
              /** Array of statuses for each canceled order. */
              statuses: v.pipe(
                v.array(
                  v.union([
                    v.literal("success"),
                    v.object({
                      /** Error message returned by the exchange. */
                      error: v.pipe(
                        v.string(),
                        v.description("Error message returned by the exchange."),
                      ),
                    }),
                  ]),
                ),
                v.description("Array of statuses for each canceled order."),
              ),
            }),
            v.description("Specific data."),
          ),
        }),
        v.description("Response details."),
      ),
    }),
    v.description("Response for order cancellation."),
  );
})();
export type CancelResponse = v.InferOutput<typeof CancelResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const CancelParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(CancelRequest.entries.action.entries),
    ["type"],
  );
})();
/** Action parameters for the {@linkcode cancel} function. */
export type CancelParameters = v.InferInput<typeof CancelParameters>;

/** Request options for the {@linkcode cancel} function. */
export type CancelOptions = ExtractRequestOptions<v.InferInput<typeof CancelRequest>>;

/** Successful variant of {@linkcode CancelResponse} without errors. */
export type CancelSuccessResponse = ExcludeErrorResponse<CancelResponse>;

/**
 * Cancel order(s).
 *
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 *
 * @returns Successful variant of {@link CancelResponse} without error statuses.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { cancel } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await cancel(
 *   { transport, wallet },
 *   {
 *     cancels: [
 *       { a: 0, o: 123 },
 *     ],
 *   },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
 */
export function cancel(
  config: ExchangeConfig,
  params: CancelParameters,
  opts?: CancelOptions,
): Promise<CancelSuccessResponse> {
  const action = v.parse(CancelParameters, params);
  return executeL1Action(config, { type: "cancel", ...action }, opts);
}
