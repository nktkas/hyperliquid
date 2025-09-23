import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedDecimal } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

/**
 * Request user existence check before transfer.
 * @see null
 */
export const PreTransferCheckRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("preTransferCheck"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Source address. */
      source: v.pipe(
        Address,
        v.description("Source address."),
      ),
    }),
    v.description("Request user existence check before transfer."),
  );
})();
export type PreTransferCheckRequest = v.InferOutput<typeof PreTransferCheckRequest>;

/**
 * Pre-transfer user existence check result.
 * @see null
 */
export const PreTransferCheckResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Activation fee. */
      fee: v.pipe(
        UnsignedDecimal,
        v.description("Activation fee."),
      ),
      /** Whether the user is sanctioned. */
      isSanctioned: v.pipe(
        v.boolean(),
        v.description("Whether the user is sanctioned."),
      ),
      /** Whether the user exists. */
      userExists: v.pipe(
        v.boolean(),
        v.description("Whether the user exists."),
      ),
      /** Whether the user has sent a transaction. */
      userHasSentTx: v.pipe(
        v.boolean(),
        v.description("Whether the user has sent a transaction."),
      ),
    }),
    v.description("Pre-transfer user existence check result."),
  );
})();
export type PreTransferCheckResponse = v.InferOutput<typeof PreTransferCheckResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode preTransferCheck} function. */
export type PreTransferCheckParameters = Omit<v.InferInput<typeof PreTransferCheckRequest>, "type">;

/**
 * Request user existence check before transfer.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Pre-transfer user existence check result.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { preTransferCheck } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await preTransferCheck(
 *   { transport },
 *   { user: "0x...", source: "0x..." },
 * );
 * ```
 */
export function preTransferCheck(
  config: InfoRequestConfig,
  params: DeepImmutable<PreTransferCheckParameters>,
  signal?: AbortSignal,
): Promise<PreTransferCheckResponse> {
  const request = parser(PreTransferCheckRequest)({
    type: "preTransferCheck",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
