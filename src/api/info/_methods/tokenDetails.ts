import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request token details.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-a-token
 */
export const TokenDetailsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("tokenDetails"),
    /** Token ID. */
    tokenId: v.pipe(Hex, v.length(34)),
  });
})();
export type TokenDetailsRequest = v.InferOutput<typeof TokenDetailsRequest>;

/**
 * Details of a token.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-a-token
 */
export const TokenDetailsResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** Name of the token. */
    name: v.string(),
    /** Maximum supply of the token. */
    maxSupply: UnsignedDecimal,
    /** Total supply of the token. */
    totalSupply: UnsignedDecimal,
    /** Circulating supply of the token. */
    circulatingSupply: UnsignedDecimal,
    /** Decimal places for the minimum tradable unit. */
    szDecimals: UnsignedInteger,
    /** Decimal places for the token's smallest unit. */
    weiDecimals: UnsignedInteger,
    /** Mid price of the token. */
    midPx: UnsignedDecimal,
    /** Mark price of the token. */
    markPx: UnsignedDecimal,
    /** Previous day's price of the token. */
    prevDayPx: UnsignedDecimal,
    /** Genesis data for the token. */
    genesis: v.nullable(
      v.object({
        /** User balances. */
        userBalances: v.array(v.tuple([Address, v.string()])),
        /** Existing token balances. */
        existingTokenBalances: v.array(v.tuple([UnsignedInteger, v.string()])),
        /** Blacklisted users. */
        blacklistUsers: v.array(Address),
      }),
    ),
    /** Deployer address. */
    deployer: v.nullable(Address),
    /** Gas used during token deployment. */
    deployGas: v.nullable(UnsignedDecimal),
    /** Deployment time. */
    deployTime: v.nullable(v.string()),
    /** Seeded USDC amount for the token. */
    seededUsdc: UnsignedDecimal,
    /** Non-circulating user balances of the token. */
    nonCirculatingUserBalances: v.array(v.tuple([Address, v.string()])),
    /** Future emissions amount. */
    futureEmissions: UnsignedDecimal,
  });
})();
export type TokenDetailsResponse = v.InferOutput<typeof TokenDetailsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode tokenDetails} function. */
export type TokenDetailsParameters = Omit<v.InferInput<typeof TokenDetailsRequest>, "type">;

/**
 * Request token details.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Details of a token.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { tokenDetails } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await tokenDetails(
 *   { transport },
 *   { tokenId: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-a-token
 */
export function tokenDetails(
  config: InfoConfig,
  params: TokenDetailsParameters,
  signal?: AbortSignal,
): Promise<TokenDetailsResponse> {
  const request = v.parse(TokenDetailsRequest, {
    type: "tokenDetails",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
