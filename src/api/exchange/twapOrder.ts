import { Address, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import {
  type ExchangeRequestConfig,
  executeL1Action,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  type MultiSignRequestConfig,
  Signature,
} from "./_common.ts";
import * as v from "valibot";

// -------------------- Schemas --------------------

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
      /** Unique request identifier (current timestamp in ms). */
      nonce: v.pipe(
        UnsignedInteger,
        v.description("Unique request identifier (current timestamp in ms)."),
      ),
      /** Cryptographic signature. */
      signature: v.pipe(
        Signature,
        v.description("Cryptographic signature."),
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
    v.description("Place a TWAP order."),
  );
})();
export type TwapOrderRequest = v.InferOutput<typeof TwapOrderRequest>;

/** Response for creating a TWAP order. */
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

/** Successful variant of {@linkcode TwapOrderResponse} without errors. */
export const TwapOrderSuccessResponse = /* @__PURE__ */ (() => {
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
              /** Status of the operation. */
              status: v.pipe(
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
                v.description("Status of the operation."),
              ),
            }),
            v.description("Specific data."),
          ),
        }),
        v.description("Response details."),
      ),
    }),
    v.description("Successful variant of `TwapOrderResponse` without errors."),
  );
})();
export type TwapOrderSuccessResponse = v.InferOutput<typeof TwapOrderSuccessResponse>;

// -------------------- Function --------------------

/** Action parameters for the {@linkcode twapOrder} function. */
export type TwapOrderParameters = ExtractRequestAction<v.InferInput<typeof TwapOrderRequest>>;
/** Request options for the {@linkcode twapOrder} function. */
export type TwapOrderOptions = ExtractRequestOptions<v.InferInput<typeof TwapOrderRequest>>;

/**
 * Place a TWAP order.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful variant of {@link TwapOrderResponse} without error status.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-twap-order
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
 */
export async function twapOrder(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<TwapOrderParameters>,
  opts?: TwapOrderOptions,
): Promise<TwapOrderSuccessResponse> {
  const action = parser(TwapOrderRequest.entries.action)({
    type: "twapOrder",
    ...params,
  });
  const vaultAddress = opts?.vaultAddress ?? config.defaultVaultAddress;
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, vaultAddress, expiresAfter }, opts?.signal);
}
