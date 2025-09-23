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
 * Schedule a cancel-all operation at a future time.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch
 */
export const ScheduleCancelRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("scheduleCancel"),
            v.description("Type of action."),
          ),
          /**
           * Scheduled time (in ms since epoch).
           * Must be at least 5 seconds in the future.
           *
           * If not specified, will cause all scheduled cancel operations to be deleted.
           */
          time: v.pipe(
            v.optional(UnsignedInteger),
            v.description(
              "Scheduled time (in ms since epoch)." +
                "\nMust be at least 5 seconds in the future." +
                "\n\nIf not specified, will cause all scheduled cancel operations to be deleted.",
            ),
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
    v.description("Schedule a cancel-all operation at a future time."),
  );
})();
export type ScheduleCancelRequest = v.InferOutput<typeof ScheduleCancelRequest>;

import { SuccessResponse } from "./_common.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode scheduleCancel} function. */
export type ScheduleCancelParameters = ExtractRequestAction<v.InferInput<typeof ScheduleCancelRequest>>;
/** Request options for the {@linkcode scheduleCancel} function. */
export type ScheduleCancelOptions = ExtractRequestOptions<v.InferInput<typeof ScheduleCancelRequest>>;

/**
 * Schedule a cancel-all operation at a future time.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { scheduleCancel } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await scheduleCancel(
 *   { transport, wallet },
 *   { time: Date.now() + 10_000 },
 * );
 * ```
 */
export async function scheduleCancel(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params?: DeepImmutable<ScheduleCancelParameters>,
  opts?: ScheduleCancelOptions,
): Promise<SuccessResponse>;
export async function scheduleCancel(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  opts?: ScheduleCancelOptions,
): Promise<SuccessResponse>;
export async function scheduleCancel(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  paramsOrOpts?:
    | DeepImmutable<ScheduleCancelParameters>
    | ScheduleCancelOptions,
  maybeOpts?: ScheduleCancelOptions,
): Promise<SuccessResponse> {
  const isFirstArgParams = paramsOrOpts && "time" in paramsOrOpts;
  const params = isFirstArgParams ? paramsOrOpts : {};
  const opts = isFirstArgParams ? maybeOpts : paramsOrOpts as ScheduleCancelOptions;

  const action = parser(ScheduleCancelRequest.entries.action)({
    type: "scheduleCancel",
    ...params,
  });
  const vaultAddress = opts?.vaultAddress ?? config.defaultVaultAddress;
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, vaultAddress, expiresAfter }, opts?.signal);
}
