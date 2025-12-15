import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { SignatureSchema } from "./_base/commonSchemas.ts";

/**
 * Cancel a TWAP order.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order
 */
export const TwapCancelRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("twapCancel"),
            v.description("Type of action."),
          ),
          /** Asset ID. */
          a: v.pipe(
            UnsignedInteger,
            v.description("Asset ID."),
          ),
          /** Twap ID. */
          t: v.pipe(
            UnsignedInteger,
            v.description("Twap ID."),
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
    v.description("Cancel a TWAP order."),
  );
})();
export type TwapCancelRequest = v.InferOutput<typeof TwapCancelRequest>;

/**
 * Response for canceling a TWAP order.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order
 */
export const TwapCancelResponse = /* @__PURE__ */ (() => {
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
            v.literal("twapCancel"),
            v.description("Type of response."),
          ),
          /** Specific data. */
          data: v.pipe(
            v.object({
              /** Status of the operation or error message. */
              status: v.pipe(
                v.union([
                  v.string(),
                  v.object({
                    /** Error message. */
                    error: v.pipe(
                      v.string(),
                      v.description("Error message."),
                    ),
                  }),
                ]),
                v.description("Status of the operation or error message."),
              ),
            }),
            v.description("Specific data."),
          ),
        }),
        v.description("Response details."),
      ),
    }),
    v.description("Response for canceling a TWAP order."),
  );
})();
export type TwapCancelResponse = v.InferOutput<typeof TwapCancelResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const TwapCancelParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(TwapCancelRequest.entries.action.entries),
    ["type"],
  );
})();
/** Action parameters for the {@linkcode twapCancel} function. */
export type TwapCancelParameters = v.InferInput<typeof TwapCancelParameters>;

/** Request options for the {@linkcode twapCancel} function. */
export type TwapCancelOptions = ExtractRequestOptions<v.InferInput<typeof TwapCancelRequest>>;

/** Successful variant of {@linkcode TwapCancelResponse} without errors. */
export type TwapCancelSuccessResponse = ExcludeErrorResponse<TwapCancelResponse>;

/**
 * Cancel a TWAP order.
 *
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 *
 * @returns Successful variant of {@link TwapCancelResponse} without error status.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { twapCancel } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await twapCancel(
 *   { transport, wallet },
 *   { a: 0, t: 1 },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order
 */
export function twapCancel(
  config: ExchangeConfig,
  params: TwapCancelParameters,
  opts?: TwapCancelOptions,
): Promise<TwapCancelSuccessResponse> {
  const action = v.parse(TwapCancelParameters, params);
  return executeL1Action(config, { type: "twapCancel", ...action }, opts);
}
