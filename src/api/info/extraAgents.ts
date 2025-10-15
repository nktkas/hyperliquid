import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedInteger } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

// -------------------- Schemas --------------------

/**
 * Request user extra agents.
 * @see null
 */
export const ExtraAgentsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("extraAgents"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user extra agents."),
  );
})();
export type ExtraAgentsRequest = v.InferOutput<typeof ExtraAgentsRequest>;

/**
 * Array of extra agent details for a user.
 * @see null
 */
export const ExtraAgentsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** Extra agent details for a user. */
      v.pipe(
        v.object({
          /** Extra agent address. */
          address: v.pipe(
            Address,
            v.description("Extra agent address."),
          ),
          /** Extra agent name. */
          name: v.pipe(
            v.string(),
            v.minLength(1),
            v.description("Extra agent name."),
          ),
          /** Validity period as a timestamp (in ms since epoch). */
          validUntil: v.pipe(
            UnsignedInteger,
            v.description("Validity period as a timestamp (in ms since epoch)."),
          ),
        }),
        v.description("Extra agent details for a user."),
      ),
    ),
    v.description("Array of extra agent details for a user."),
  );
})();
export type ExtraAgentsResponse = v.InferOutput<typeof ExtraAgentsResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode extraAgents} function. */
export type ExtraAgentsParameters = Omit<v.InferInput<typeof ExtraAgentsRequest>, "type">;

/**
 * Request user extra agents.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of extra agent details for a user.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { extraAgents } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await extraAgents(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function extraAgents(
  config: InfoRequestConfig,
  params: DeepImmutable<ExtraAgentsParameters>,
  signal?: AbortSignal,
): Promise<ExtraAgentsResponse> {
  const request = parser(ExtraAgentsRequest)({
    type: "extraAgents",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
