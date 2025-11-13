import * as v from "valibot";
import { Address, ISO8601WithoutTimezone, parser, UnsignedDecimal } from "../_base.ts";
import type { InfoRequestConfig } from "./_types.ts";

// -------------------- Schemas --------------------

/**
 * Request all perpetual dexs.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-all-perpetual-dexs
 */
export const PerpDexsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("perpDexs"),
        v.description("Type of request."),
      ),
    }),
    v.description("Request all perpetual dexs."),
  );
})();
export type PerpDexsRequest = v.InferOutput<typeof PerpDexsRequest>;

/**
 * Array of perpetual dexes (null is main dex).
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-all-perpetual-dexs
 */
export const PerpDexsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      v.nullable(
        /** Perpetual dex metadata. */
        v.pipe(
          v.object({
            /** Short name of the perpetual dex. */
            name: v.pipe(
              v.string(),
              v.description("Short name of the perpetual dex."),
            ),
            /** Complete name of the perpetual dex. */
            fullName: v.pipe(
              v.string(),
              v.description("Complete name of the perpetual dex."),
            ),
            /** Hex address of the dex deployer. */
            deployer: v.pipe(
              Address,
              v.description("Hex address of the dex deployer."),
            ),
            /** Hex address of the oracle updater, or null if not available. */
            oracleUpdater: v.pipe(
              v.nullable(Address),
              v.description("Hex address of the oracle updater, or null if not available."),
            ),
            /** Hex address of the fee recipient, or null if not available. */
            feeRecipient: v.pipe(
              v.nullable(Address),
              v.description("Hex address of the fee recipient, or null if not available."),
            ),
            /** Mapping of asset names to their streaming open interest caps. */
            assetToStreamingOiCap: v.pipe(
              v.array(v.tuple([v.string(), v.string()])),
              v.description("Mapping of asset names to their streaming open interest caps."),
            ),
            /** List of delegated function names and their authorized executor addresses. */
            subDeployers: v.pipe(
              v.array(
                v.tuple([
                  v.string(),
                  v.array(Address),
                ]),
              ),
              v.description("List of delegated function names and their authorized executor addresses."),
            ),
            /** Fee scale applied to deployer fees. */
            deployerFeeScale: v.pipe(
              UnsignedDecimal,
              v.description("Fee scale applied to deployer fees."),
            ),
            /** ISO 8601 timestamp (without timezone) of the last deployer fee scale change. */
            lastDeployerFeeScaleChangeTime: v.pipe(
              ISO8601WithoutTimezone,
              v.description("ISO 8601 timestamp (without timezone) of the last deployer fee scale change."),
            ),
          }),
          v.description(" Perpetual dex metadata."),
        ),
      ),
    ),
    v.description("Array of perpetual dexes (null is main dex)."),
  );
})();
export type PerpDexsResponse = v.InferOutput<typeof PerpDexsResponse>;

// -------------------- Function --------------------

/**
 * Request all perpetual dexs.
 * @param config - General configuration for Info API requests.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of perpetual dexes (null is main dex).
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-all-perpetual-dexs
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { perpDexs } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await perpDexs({ transport });
 * ```
 */
export function perpDexs(
  config: InfoRequestConfig,
  signal?: AbortSignal,
): Promise<PerpDexsResponse> {
  const request = parser(PerpDexsRequest)({
    type: "perpDexs",
  });
  return config.transport.request("info", request, signal);
}
