import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../../_schemas.ts";

/**
 * Schedule a cancel-all operation at a future time.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch
 */
export const ScheduleCancelRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("scheduleCancel"),
      /**
       * Scheduled time (in ms since epoch).
       * Must be at least 5 seconds in the future.
       *
       * If not specified, will cause all scheduled cancel operations to be deleted.
       */
      time: v.optional(UnsignedInteger),
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
    /** Vault address (for vault trading). */
    vaultAddress: v.optional(Address),
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type ScheduleCancelRequest = v.InferOutput<typeof ScheduleCancelRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch
 */
export type ScheduleCancelResponse =
  | {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
      /** Type of response. */
      type: "default";
    };
  }
  | {
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
const ScheduleCancelActionSchema = /* @__PURE__ */ (() => {
  return v.object(ScheduleCancelRequest.entries.action.entries);
})();

/** Action parameters for the {@linkcode scheduleCancel} function. */
export type ScheduleCancelParameters = Omit<v.InferInput<typeof ScheduleCancelActionSchema>, "type">;

/** Request options for the {@linkcode scheduleCancel} function. */
export type ScheduleCancelOptions = ExtractRequestOptions<v.InferInput<typeof ScheduleCancelRequest>>;

/** Successful variant of {@linkcode ScheduleCancelResponse} without errors. */
export type ScheduleCancelSuccessResponse = ExcludeErrorResponse<ScheduleCancelResponse>;

/**
 * Schedule a cancel-all operation at a future time.
 *
 * Signing: L1 Action.
 *
 * @param config General configuration for Exchange API requests.
 * @param params Parameters specific to the API request.
 * @param opts Request execution options.
 * @return Successful response without specific data.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
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
 * await scheduleCancel({ transport, wallet }, {
 *   time: Date.now() + 10_000,
 * });
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

  const action = parse(ScheduleCancelActionSchema, { type: "scheduleCancel", ...params });
  return executeL1Action(config, action, opts);
}
