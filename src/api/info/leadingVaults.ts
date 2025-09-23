import * as v from "valibot";
import { Address, type DeepImmutable, parser } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

/**
 * Request leading vaults for a user.
 * @see null
 */
export const LeadingVaultsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("leadingVaults"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request leading vaults for a user."),
  );
})();
export type LeadingVaultsRequest = v.InferOutput<typeof LeadingVaultsRequest>;

/**
 * Array of leading vaults for a user.
 * @see null
 */
export const LeadingVaultsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** Vault that a user is leading. */
      v.pipe(
        v.object({
          /** Vault address. */
          address: v.pipe(
            Address,
            v.description("Vault address."),
          ),
          /** Vault name. */
          name: v.pipe(
            v.string(),
            v.description("Vault name."),
          ),
        }),
        v.description("Vault that a user is leading."),
      ),
    ),
    v.description("Array of leading vaults for a user."),
  );
})();
export type LeadingVaultsResponse = v.InferOutput<typeof LeadingVaultsResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode leadingVaults} function. */
export type LeadingVaultsParameters = Omit<v.InferInput<typeof LeadingVaultsRequest>, "type">;

/**
 * Request leading vaults for a user.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of leading vaults for a user.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { leadingVaults } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await leadingVaults(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function leadingVaults(
  config: InfoRequestConfig,
  params: DeepImmutable<LeadingVaultsParameters>,
  signal?: AbortSignal,
): Promise<LeadingVaultsResponse> {
  const request = parser(LeadingVaultsRequest)({
    type: "leadingVaults",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
