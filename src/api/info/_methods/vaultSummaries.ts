import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { VaultRelationshipSchema } from "./_base/commonSchemas.ts";

/**
 * Request a list of vaults less than 2 hours old.
 */
export const VaultSummariesRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("vaultSummaries"),
  });
})();
export type VaultSummariesRequest = v.InferOutput<typeof VaultSummariesRequest>;

/**
 * Array of vaults less than 2 hours old.
 */
export const VaultSummariesResponse = /* @__PURE__ */ (() => {
  return v.array(
    v.object({
      /** Vault name. */
      name: v.string(),
      /** Vault address. */
      vaultAddress: Address,
      /** Leader address. */
      leader: Address,
      /** Total value locked. */
      tvl: UnsignedDecimal,
      /** Vault closure status. */
      isClosed: v.boolean(),
      /** Vault relationship type. */
      relationship: VaultRelationshipSchema,
      /** Creation timestamp. */
      createTimeMillis: UnsignedInteger,
    }),
  );
})();
export type VaultSummariesResponse = v.InferOutput<typeof VaultSummariesResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request a list of vaults less than 2 hours old.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of vaults less than 2 hours old.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { vaultSummaries } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await vaultSummaries({ transport });
 * ```
 */
export function vaultSummaries(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<VaultSummariesResponse> {
  const request = v.parse(VaultSummariesRequest, {
    type: "vaultSummaries",
  });
  return config.transport.request("info", request, signal);
}
