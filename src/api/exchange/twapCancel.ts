import { Address, type DeepImmutable, parser, UnsignedInteger } from "../_base.ts";
import {
  type ExchangeRequestConfig,
  executeL1Action,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  type MultiSignRequestConfig,
  Signature,
} from "./_base.ts";
import * as v from "valibot";

// -------------------- Schemas --------------------

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
    v.description("Cancel a TWAP order."),
  );
})();
export type TwapCancelRequest = v.InferOutput<typeof TwapCancelRequest>;

/** Response for canceling a TWAP order. */
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

/** Successful variant of {@linkcode TwapCancelResponse} without errors. */
export const TwapCancelSuccessResponse = /* @__PURE__ */ (() => {
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
              /** Status of the operation. */
              status: v.pipe(
                v.string(),
                v.description("Status of the operation."),
              ),
            }),
            v.description("Specific data."),
          ),
        }),
        v.description("Response details."),
      ),
    }),
    v.description("Successful variant of `TwapCancelResponse` without errors."),
  );
})();
export type TwapCancelSuccessResponse = v.InferOutput<typeof TwapCancelSuccessResponse>;

// -------------------- Function --------------------

/** Action parameters for the {@linkcode twapCancel} function. */
export type TwapCancelParameters = ExtractRequestAction<v.InferInput<typeof TwapCancelRequest>>;
/** Request options for the {@linkcode twapCancel} function. */
export type TwapCancelOptions = ExtractRequestOptions<v.InferInput<typeof TwapCancelRequest>>;

/**
 * Cancel a TWAP order.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful variant of {@link TwapCancelResponse} without error status.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order
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
 */
export async function twapCancel(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<TwapCancelParameters>,
  opts?: TwapCancelOptions,
): Promise<TwapCancelSuccessResponse> {
  const action = parser(TwapCancelRequest.entries.action)({
    type: "twapCancel",
    ...params,
  });
  const vaultAddress = opts?.vaultAddress ?? config.defaultVaultAddress;
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, vaultAddress, expiresAfter }, opts?.signal);
}
