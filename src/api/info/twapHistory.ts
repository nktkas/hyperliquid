import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedInteger } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

import { TwapStateSchema, TwapStatusSchema } from "../_common_schemas.ts";

// -------------------- Schemas --------------------

/**
 * Request twap history of a user.
 * @see null
 */
export const TwapHistoryRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("twapHistory"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request twap history of a user."),
  );
})();
export type TwapHistoryRequest = v.InferOutput<typeof TwapHistoryRequest>;

/**
 * Array of user's TWAP history.
 * @see null
 */
export const TwapHistoryResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** TWAP history record. */
      v.pipe(
        v.object({
          /** Creation time of the history record (in seconds since epoch). */
          time: v.pipe(
            UnsignedInteger,
            v.description("Creation time of the history record (in seconds since epoch)."),
          ),
          /** State of the TWAP order. */
          state: TwapStateSchema,
          /** Current status of the TWAP order. */
          status: TwapStatusSchema,
        }),
        v.description("TWAP history record."),
      ),
    ),
    v.description("Array of user's TWAP history."),
  );
})();
export type TwapHistoryResponse = v.InferOutput<typeof TwapHistoryResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode twapHistory} function. */
export type TwapHistoryParameters = Omit<v.InferInput<typeof TwapHistoryRequest>, "type">;

/**
 * Request twap history of a user.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of user's TWAP history.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { twapHistory } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await twapHistory(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function twapHistory(
  config: InfoRequestConfig,
  params: DeepImmutable<TwapHistoryParameters>,
  signal?: AbortSignal,
): Promise<TwapHistoryResponse> {
  const request = parser(TwapHistoryRequest)({
    type: "twapHistory",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
