import * as v from "valibot";
import { parser } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

// -------------------- Schemas --------------------

/**
 * Request liquidatable.
 * @see null
 */
export const LiquidatableRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("liquidatable"),
        v.description("Type of request."),
      ),
    }),
    v.description("Request liquidatable."),
  );
})();
export type LiquidatableRequest = v.InferOutput<typeof LiquidatableRequest>;

/**
 * @see null
 */
export const LiquidatableResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(v.unknown()),
  );
})();
export type LiquidatableResponse = v.InferOutput<typeof LiquidatableResponse>;

// -------------------- Function --------------------

/**
 * Request liquidatable.
 * @param config - General configuration for Info API requests.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { liquidatable } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await liquidatable({ transport });
 * ```
 */
export function liquidatable(
  config: InfoRequestConfig,
  signal?: AbortSignal,
): Promise<LiquidatableResponse> {
  const request = parser(LiquidatableRequest)({
    type: "liquidatable",
  });
  return config.transport.request("info", request, signal);
}
