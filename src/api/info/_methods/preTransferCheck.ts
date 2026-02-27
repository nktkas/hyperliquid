import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

/**
 * Request user existence check before transfer.
 * @see null
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
 * @see null
 */
export type PreTransferCheckResponse = {
  /**
   * Activation fee.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  fee: string;
  /** Whether the user is sanctioned. */
  isSanctioned: boolean;
  /** Whether the user exists. */
  userExists: boolean;
  /** Whether the user has sent a transaction. */
  userHasSentTx: boolean;
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode preTransferCheck} function. */
export type PreTransferCheckParameters = Omit<v.InferInput<typeof PreTransferCheckRequest>, "type">;

/**
 * Request user existence check before transfer.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Pre-transfer user existence check result.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
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
 *
 * @see null
 */
export function preTransferCheck(
  config: InfoConfig,
  params: PreTransferCheckParameters,
  signal?: AbortSignal,
): Promise<PreTransferCheckResponse> {
  const request = parse(PreTransferCheckRequest, {
    type: "preTransferCheck",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
