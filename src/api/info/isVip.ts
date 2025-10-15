import * as v from "valibot";
import { Address, type DeepImmutable, parser } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

// -------------------- Schemas --------------------

/**
 * Request to check if a user is a VIP.
 * @see null
 */
export const IsVipRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("isVip"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request to check if a user is a VIP."),
  );
})();
export type IsVipRequest = v.InferOutput<typeof IsVipRequest>;

/**
 * Boolean indicating user's VIP status.
 * @see null
 */
export const IsVipResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.nullable(v.boolean()),
    v.description("Boolean indicating user's VIP status."),
  );
})();
export type IsVipResponse = v.InferOutput<typeof IsVipResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode isVip} function. */
export type IsVipParameters = Omit<v.InferInput<typeof IsVipRequest>, "type">;

/**
 * Request to check if a user is a VIP.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Boolean indicating user's VIP status.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { isVip } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await isVip(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function isVip(
  config: InfoRequestConfig,
  params: DeepImmutable<IsVipParameters>,
  signal?: AbortSignal,
): Promise<IsVipResponse> {
  const request = parser(IsVipRequest)({
    type: "isVip",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
