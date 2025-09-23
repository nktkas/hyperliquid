import { Address, type DeepImmutable, parser, UnsignedInteger } from "../_common.ts";
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
          /** Orders to cancel. */
          cancels: v.pipe(
            v.array(v.object({
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
            })),
            v.description("Orders to cancel."),
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
    v.description("Cancel order(s)."),
  );
})();
export type CancelRequest = v.InferOutput<typeof CancelRequest>;

/** Response for order cancellation. */
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
              /** Array of statuses or error messages. */
              statuses: v.pipe(
                v.array(
                  v.union([
                    v.literal("success"),
                    v.object({
                      /** Error message. */
                      error: v.pipe(
                        v.string(),
                        v.description("Error message."),
                      ),
                    }),
                  ]),
                ),
                v.description("Array of statuses or error messages."),
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

/** Successful variant of {@linkcode CancelResponse} without errors. */
export const CancelSuccessResponse = /* @__PURE__ */ (() => {
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
              /** Array of success statuses. */
              statuses: v.pipe(
                v.array(v.literal("success")),
                v.description("Array of success statuses."),
              ),
            }),
            v.description("Specific data."),
          ),
        }),
        v.description("Response details."),
      ),
    }),
    v.description("Successful variant of `CancelResponse` without errors."),
  );
})();
export type CancelSuccessResponse = v.InferOutput<typeof CancelSuccessResponse>;

// -------------------- Function --------------------

/** Action parameters for the {@linkcode cancel} function. */
export type CancelParameters = ExtractRequestAction<v.InferInput<typeof CancelRequest>>;
/** Request options for the {@linkcode cancel} function. */
export type CancelOptions = ExtractRequestOptions<v.InferInput<typeof CancelRequest>>;

/**
 * Cancel order(s).
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful variant of {@link CancelResponse} without error statuses.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
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
 */
export async function cancel(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<CancelParameters>,
  opts?: CancelOptions,
): Promise<CancelSuccessResponse> {
  const action = parser(CancelRequest.entries.action)({
    type: "cancel",
    ...params,
  });
  const vaultAddress = opts?.vaultAddress ?? config.defaultVaultAddress;
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, vaultAddress, expiresAfter }, opts?.signal);
}
