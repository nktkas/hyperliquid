import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal } from "../../_schemas.ts";

/**
 * Request user existence check before transfer.
 */
export const PreTransferCheckRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("preTransferCheck"),
    /** User address. */
    user: Address,
    /** Source address. */
    source: Address,
  });
})();
export type PreTransferCheckRequest = v.InferOutput<typeof PreTransferCheckRequest>;

/**
 * Pre-transfer user existence check result.
 */
export const PreTransferCheckResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** Activation fee. */
    fee: UnsignedDecimal,
    /** Whether the user is sanctioned. */
    isSanctioned: v.boolean(),
    /** Whether the user exists. */
    userExists: v.boolean(),
    /** Whether the user has sent a transaction. */
    userHasSentTx: v.boolean(),
  });
})();
export type PreTransferCheckResponse = v.InferOutput<typeof PreTransferCheckResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode preTransferCheck} function. */
export type PreTransferCheckParameters = Omit<v.InferInput<typeof PreTransferCheckRequest>, "type">;

/**
 * Request user existence check before transfer.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Pre-transfer user existence check result.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { preTransferCheck } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await preTransferCheck(
 *   { transport },
 *   { user: "0x...", source: "0x..." },
 * );
 * ```
 */
export function preTransferCheck(
  config: InfoConfig,
  params: PreTransferCheckParameters,
  signal?: AbortSignal,
): Promise<PreTransferCheckResponse> {
  const request = v.parse(PreTransferCheckRequest, {
    type: "preTransferCheck",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
