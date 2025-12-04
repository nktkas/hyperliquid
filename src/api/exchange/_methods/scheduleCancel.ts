import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, Nonce, Signature, SuccessResponse } from "./_base/schemas.ts";

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
    v.description("Schedule a cancel-all operation at a future time."),
  );
})();
export type ScheduleCancelRequest = v.InferOutput<typeof ScheduleCancelRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch
 */
export const ScheduleCancelResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type ScheduleCancelResponse = v.InferOutput<typeof ScheduleCancelResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const ScheduleCancelParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(ScheduleCancelRequest.entries.action.entries),
    ["type"],
  );
})();
/** Action parameters for the {@linkcode scheduleCancel} function. */
export type ScheduleCancelParameters = v.InferInput<typeof ScheduleCancelParameters>;

/** Request options for the {@linkcode scheduleCancel} function. */
export type ScheduleCancelOptions = ExtractRequestOptions<v.InferInput<typeof ScheduleCancelRequest>>;

/** Successful variant of {@linkcode ScheduleCancelResponse} without errors. */
export type ScheduleCancelSuccessResponse = ExcludeErrorResponse<ScheduleCancelResponse>;

/**
 * Schedule a cancel-all operation at a future time.
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
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch
 */
export function scheduleCancel(
  config: ExchangeConfig,
  params?: ScheduleCancelParameters,
  opts?: ScheduleCancelOptions,
): Promise<ScheduleCancelSuccessResponse>;
export function scheduleCancel(
  config: ExchangeConfig,
  opts?: ScheduleCancelOptions,
): Promise<ScheduleCancelSuccessResponse>;
export function scheduleCancel(
  config: ExchangeConfig,
  paramsOrOpts?: ScheduleCancelParameters | ScheduleCancelOptions,
  maybeOpts?: ScheduleCancelOptions,
): Promise<ScheduleCancelSuccessResponse> {
  const isFirstArgParams = paramsOrOpts && "time" in paramsOrOpts;
  const params = isFirstArgParams ? paramsOrOpts : {};
  const opts = isFirstArgParams ? maybeOpts : paramsOrOpts as ScheduleCancelOptions;

  const action = v.parse(ScheduleCancelParameters, params);
  return executeL1Action(config, { type: "scheduleCancel", ...action }, opts);
}
