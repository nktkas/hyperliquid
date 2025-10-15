import * as v from "valibot";
import { parser, UnsignedInteger } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

// -------------------- Schemas --------------------

/**
 * Request exchange system status information.
 * @see null
 */
export const ExchangeStatusRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("exchangeStatus"),
        v.description("Type of request."),
      ),
    }),
    v.description("Request exchange system status information."),
  );
})();
export type ExchangeStatusRequest = v.InferOutput<typeof ExchangeStatusRequest>;

/**
 * Exchange system status information.
 * @see null
 */
export const ExchangeStatusResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Server time (in ms since epoch). */
      time: v.pipe(
        UnsignedInteger,
        v.description("Server time (in ms since epoch)."),
      ),
      specialStatuses: v.pipe(
        v.nullable(v.unknown()),
      ),
    }),
    v.description("Exchange system status information."),
  );
})();
export type ExchangeStatusResponse = v.InferOutput<typeof ExchangeStatusResponse>;

// -------------------- Function --------------------

/**
 * Request exchange system status information.
 * @param config - General configuration for Info API requests.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Exchange system status information.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { exchangeStatus } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await exchangeStatus({ transport });
 * ```
 */
export function exchangeStatus(
  config: InfoRequestConfig,
  signal?: AbortSignal,
): Promise<ExchangeStatusResponse> {
  const request = parser(ExchangeStatusRequest)({
    type: "exchangeStatus",
  });
  return config.transport.request("info", request, signal);
}
