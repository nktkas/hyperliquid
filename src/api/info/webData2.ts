import * as v from "valibot";
import { Address, type DeepImmutable, parser } from "../_base.ts";
import type { InfoRequestConfig } from "./_types.ts";

import { WebData2Event } from "../subscription/webData2.ts";

// -------------------- Schemas --------------------

/**
 * Request comprehensive user and market data.
 * @see null
 */
export const WebData2Request = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("webData2"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request comprehensive user and market data."),
  );
})();
export type WebData2Request = v.InferOutput<typeof WebData2Request>;

/**
 * Comprehensive user and market data.
 * @see null
 */
export const WebData2Response = /* @__PURE__ */ (() => {
  return v.pipe(
    WebData2Event,
    v.description("Comprehensive user and market data."),
  );
})();
export type WebData2Response = v.InferOutput<typeof WebData2Response>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode webData2} function. */
export type WebData2Parameters = Omit<v.InferInput<typeof WebData2Request>, "type">;

/**
 * Request comprehensive user and market data.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Comprehensive user and market data.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { webData2 } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await webData2(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function webData2(
  config: InfoRequestConfig,
  params: DeepImmutable<WebData2Parameters>,
  signal?: AbortSignal,
): Promise<WebData2Response> {
  const request = parser(WebData2Request)({
    type: "webData2",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
