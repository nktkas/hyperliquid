import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request a list of vaults less than 2 hours old.
 */
export const VaultSummariesRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("vaultSummaries"),
        v.description("Type of request."),
      ),
    }),
    v.description("Request a list of vaults less than 2 hours old."),
  );
})();
export type VaultSummariesRequest = v.InferOutput<typeof VaultSummariesRequest>;

/**
 * Array of vaults less than 2 hours old.
 */
export const VaultSummariesResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** Summary of a vault. */
      v.pipe(
        v.object({
          /** Vault name. */
          name: v.pipe(
            v.string(),
            v.description("Vault name."),
          ),
          /** Vault address. */
          vaultAddress: v.pipe(
            Address,
            v.description("Vault address."),
          ),
          /** Leader address. */
          leader: v.pipe(
            Address,
            v.description("Leader address."),
          ),
          /** Total value locked. */
          tvl: v.pipe(
            UnsignedDecimal,
            v.description("Total value locked."),
          ),
          /** Vault closure status. */
          isClosed: v.pipe(
            v.boolean(),
            v.description("Vault closure status."),
          ),
          /** Vault relationship type. */
          relationship: v.pipe(
            v.variant("type", [
              v.object({
                /** Relationship type. */
                type: v.pipe(
                  v.picklist(["normal", "child"]),
                  v.description("Relationship type."),
                ),
              }),
              v.object({
                /** Relationship type. */
                type: v.pipe(
                  v.literal("parent"),
                  v.description("Relationship type."),
                ),
                /** Child vault information. */
                data: v.pipe(
                  v.object({
                    /** Child vault addresses. */
                    childAddresses: v.pipe(
                      v.array(Address),
                      v.description("Child vault addresses."),
                    ),
                  }),
                  v.description("Child vault information."),
                ),
              }),
            ]),
            v.description("Vault relationship type."),
          ),
          /** Creation timestamp. */
          createTimeMillis: v.pipe(
            UnsignedInteger,
            v.description("Creation timestamp."),
          ),
        }),
        v.description("Summary of a vault."),
      ),
    ),
    v.description("Array of vaults less than 2 hours old."),
  );
})();
export type VaultSummariesResponse = v.InferOutput<typeof VaultSummariesResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_types.ts";

/**
 * Request a list of vaults less than 2 hours old.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
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
