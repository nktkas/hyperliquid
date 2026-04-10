import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Place a TWAP order.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-twap-order
 */
export const TwapOrderRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("twapOrder"),
      /** Twap parameters. */
      twap: v.object({
        /** Asset ID. */
        a: UnsignedInteger,
        /** Position side (`true` for long, `false` for short). */
        b: v.boolean(),
        /** Size (in base currency units). */
        s: UnsignedDecimal,
        /** Is reduce-only? */
        r: v.boolean(),
        /** TWAP duration in minutes. */
        m: v.pipe(UnsignedInteger, v.minValue(5), v.maxValue(1440)),
        /** Enable random order timing. */
        t: v.boolean(),
      }),
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
export type TwapOrderRequest = v.InferOutput<typeof TwapOrderRequest>;

/**
 * Response for creating a TWAP order.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-twap-order
 */
export type TwapOrderResponse = {
  /** Successful status. */
  status: "ok";
  /** Response details. */
  response: {
    /** Type of response. */
    type: "twapOrder";
    /** Specific data. */
    data: {
      /** Status of the operation or error message. */
      status: {
        /** Running order status. */
        running: {
          /** TWAP ID. */
          twapId: number;
        };
      } | {
        /** Error message. */
        error: string;
      };
    };
  };
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import { canonicalize } from "../../../signing/mod.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for action fields (excludes request-level system fields). */
const TwapOrderActionSchema = /* @__PURE__ */ (() => {
  return v.object(TwapOrderRequest.entries.action.entries);
})();

/** Action parameters for the {@linkcode twapOrder} function. */
export type TwapOrderParameters = Omit<v.InferInput<typeof TwapOrderActionSchema>, "type">;

/** Request options for the {@linkcode twapOrder} function. */
export type TwapOrderOptions = ExtractRequestOptions<v.InferInput<typeof TwapOrderRequest>>;

/** Successful variant of {@linkcode TwapOrderResponse} without errors. */
export type TwapOrderSuccessResponse = ExcludeErrorResponse<TwapOrderResponse>;

/**
 * Place a TWAP order.
 *
 * Signing: L1 Action.
 *
 * @param config General configuration for Exchange API requests.
 * @param params Parameters specific to the API request.
 * @param opts Request execution options.
 * @return Successful variant of {@link TwapOrderResponse} without error status.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
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
 * const data = await twapOrder({ transport, wallet }, {
 *   twap: {
 *     a: 0,
 *     b: true,
 *     s: "1",
 *     r: false,
 *     m: 10,
 *     t: true,
 *   },
 * });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-twap-order
 */
export function twapOrder(
  config: ExchangeConfig,
  params: TwapOrderParameters,
  opts?: TwapOrderOptions,
): Promise<TwapOrderSuccessResponse> {
  const action = canonicalize(
    TwapOrderActionSchema,
    parse(TwapOrderActionSchema, { type: "twapOrder", ...params }),
  );
  return executeL1Action(config, action, opts);
}
