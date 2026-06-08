import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Manually split or merge outcome shares to convert between primary and dual balances.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#split-outcome
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#merge-outcome
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#merge-question
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#negate-outcome
 */
export const UserOutcomeRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Outcome action. */
    action: v.variant("type", [
      v.object({
        /** Type of action. */
        type: v.literal("userOutcome"),
        /** Split `X` quote tokens into `X` Yes and `X` No shares of an outcome. */
        splitOutcome: v.object({
          /** Outcome identifier. */
          outcome: UnsignedInteger,
          /** Amount of quote tokens to split. */
          amount: UnsignedDecimal,
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("userOutcome"),
        /** Merge `X` Yes and `X` No shares of an outcome into `X` quote tokens. */
        mergeOutcome: v.object({
          /** Outcome identifier. */
          outcome: UnsignedInteger,
          /** Amount of shares to merge, or `null` for the maximum available. */
          amount: v.nullable(UnsignedDecimal),
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("userOutcome"),
        /** Merge `X` Yes shares from each outcome associated to the same question into `X` quote tokens. */
        mergeQuestion: v.object({
          /** Question identifier. */
          question: UnsignedInteger,
          /** Amount of shares to merge, or `null` for the maximum available. */
          amount: v.nullable(UnsignedDecimal),
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("userOutcome"),
        /**
         * Convert `X` No shares from an outcome associated with a question into
         * `X` Yes shares of every other outcome associated with the question.
         */
        negateOutcome: v.object({
          /** Question identifier. */
          question: UnsignedInteger,
          /** Outcome identifier. */
          outcome: UnsignedInteger,
          /** Amount of No shares to negate. */
          amount: UnsignedDecimal,
        }),
      }),
    ]),
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
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type UserOutcomeRequest = v.InferOutput<typeof UserOutcomeRequest>;

/**
 * Successful response without specific data or error response.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#split-outcome
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#merge-outcome
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#merge-question
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#negate-outcome
 */
export type UserOutcomeResponse =
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
import { canonicalize } from "../../../signing/mod.ts";
import {
  type ExchangeConfig,
  type ExcludeErrorResponse,
  executeL1Action,
  type ExtractRequestOptions,
} from "./_base/mod.ts";

/** Schema for action fields (excludes request-level system fields). */
const UserOutcomeActionSchema = /* @__PURE__ */ (() => {
  return v.variant("type", UserOutcomeRequest.entries.action.options);
})();

/** Action parameters for the {@linkcode userOutcome} function. */
export type UserOutcomeParameters = v.InferInput<typeof UserOutcomeActionSchema> extends infer T
  ? T extends unknown ? { [K in Exclude<keyof T, "type">]: T[K] } : never
  : never;

/** Request options for the {@linkcode userOutcome} function. */
export type UserOutcomeOptions = ExtractRequestOptions<v.InferInput<typeof UserOutcomeRequest>>;

/** Successful variant of {@linkcode UserOutcomeResponse} without errors. */
export type UserOutcomeSuccessResponse = ExcludeErrorResponse<UserOutcomeResponse>;

/**
 * Manually split or merge outcome shares to convert between primary and dual balances.
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
 * @example Split outcome
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userOutcome } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await userOutcome({ transport, wallet }, {
 *   splitOutcome: { outcome: 0, amount: "1" },
 * });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#split-outcome
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#merge-outcome
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#merge-question
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#negate-outcome
 */
export function userOutcome(
  config: ExchangeConfig,
  params: UserOutcomeParameters,
  opts?: UserOutcomeOptions,
): Promise<UserOutcomeSuccessResponse> {
  const action = canonicalize(
    UserOutcomeActionSchema,
    parse(UserOutcomeActionSchema, { type: "userOutcome", ...params }),
  );
  return executeL1Action(config, action, opts);
}
