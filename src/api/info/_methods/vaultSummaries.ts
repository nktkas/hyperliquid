import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import type { VaultRelationshipSchema } from "./_base/commonSchemas.ts";

/**
 * Request a list of vaults less than 2 hours old.
 * @see null
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
 * @see null
 */
export type VaultSummariesResponse = {
  /** Vault name. */
  name: string;
  /**
   * Vault address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  vaultAddress: `0x${string}`;
  /**
   * Leader address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  leader: `0x${string}`;
  /**
   * Total value locked.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  tvl: string;
  /** Vault closure status. */
  isClosed: boolean;
  /** Vault relationship type. */
  relationship: VaultRelationshipSchema;
  /** Creation timestamp. */
  createTimeMillis: number;
}[];

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/**
 * Request a list of vaults less than 2 hours old.
 *
 * @param config General configuration for Info API requests.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Array of vaults less than 2 hours old.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
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
 *
 * @see null
 */
export function vaultSummaries(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<VaultSummariesResponse> {
  const request = parse(VaultSummariesRequest, {
    type: "vaultSummaries",
  });
  return config.transport.request("info", request, signal);
}
