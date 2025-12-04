import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { Nonce, Signature } from "./_base/schemas.ts";

/**
 * Place a TWAP order.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-twap-order
 */
export const TwapOrderRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("twapOrder"),
            v.description("Type of action."),
          ),
          /** Twap parameters. */
          twap: v.pipe(
            v.object({
              /** Asset ID. */
              a: v.pipe(
                UnsignedInteger,
                v.description("Asset ID."),
              ),
              /** Position side (`true` for long, `false` for short). */
              b: v.pipe(
                v.boolean(),
                v.description("Position side (`true` for long, `false` for short)."),
              ),
              /** Size (in base currency units). */
              s: v.pipe(
                UnsignedDecimal,
                v.description("Size (in base currency units)."),
              ),
              /** Is reduce-only? */
              r: v.pipe(
                v.boolean(),
                v.description("Is reduce-only?"),
              ),
              /** TWAP duration in minutes. */
              m: v.pipe(
                UnsignedInteger,
                v.description("TWAP duration in minutes."),
              ),
              /** Enable random order timing. */
              t: v.pipe(
                v.boolean(),
                v.description("Enable random order timing."),
              ),
            }),
            v.description("Twap parameters."),
          ),
        }),
        v.description("Action to perform."),
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: Nonce,
      /** ECDSA signature components. */
      signature: Signature,
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
    v.description("Place a TWAP order."),
  );
})();
export type TwapOrderRequest = v.InferOutput<typeof TwapOrderRequest>;

/**
 * Response for creating a TWAP order.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-twap-order
 */
export const TwapOrderResponse = /* @__PURE__ */ (() => {
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
            v.literal("twapOrder"),
            v.description("Type of response."),
          ),
          /** Specific data. */
          data: v.pipe(
            v.object({
              /** Status of the operation or error message. */
              status: v.pipe(
                v.union([
                  v.object({
                    /** Running order status. */
                    running: v.pipe(
                      v.object({
                        /** TWAP ID. */
                        twapId: v.pipe(
                          UnsignedInteger,
                          v.description("TWAP ID."),
                        ),
                      }),
                      v.description("Running order status."),
                    ),
                  }),
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
    v.description("Response for creating a TWAP order."),
  );
})();
export type TwapOrderResponse = v.InferOutput<typeof TwapOrderResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const TwapOrderParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(TwapOrderRequest.entries.action.entries),
    ["type"],
  );
})();
/** Action parameters for the {@linkcode twapOrder} function. */
export type TwapOrderParameters = v.InferInput<typeof TwapOrderParameters>;

/** Request options for the {@linkcode twapOrder} function. */
export type TwapOrderOptions = ExtractRequestOptions<v.InferInput<typeof TwapOrderRequest>>;

/** Successful variant of {@linkcode TwapOrderResponse} without errors. */
export type TwapOrderSuccessResponse = ExcludeErrorResponse<TwapOrderResponse>;

/**
 * Place a TWAP order.
 *
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 *
 * @returns Successful variant of {@link TwapOrderResponse} without error status.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { twapOrder } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await twapOrder(
 *   { transport, wallet },
 *   {
 *     twap: {
 *       a: 0,
 *       b: true,
 *       s: "1",
 *       r: false,
 *       m: 10,
 *       t: true,
 *     },
 *   },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-twap-order
 */
export function twapOrder(
  config: ExchangeConfig,
  params: TwapOrderParameters,
  opts?: TwapOrderOptions,
): Promise<TwapOrderSuccessResponse> {
  const action = v.parse(TwapOrderParameters, params);
  return executeL1Action(config, { type: "twapOrder", ...action }, opts);
}
