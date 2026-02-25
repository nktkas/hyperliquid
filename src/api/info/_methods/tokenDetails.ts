import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex } from "../../_schemas.ts";

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
export type TokenDetailsResponse = {
  /** Name of the token. */
  name: string;
  /**
   * Maximum supply of the token.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  maxSupply: string;
  /**
   * Total supply of the token.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  totalSupply: string;
  /**
   * Circulating supply of the token.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  circulatingSupply: string;
  /** Decimal places for the minimum tradable unit. */
  szDecimals: number;
  /** Decimal places for the token's smallest unit. */
  weiDecimals: number;
  /**
   * Mid price of the token.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  midPx: string;
  /**
   * Mark price of the token.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  markPx: string;
  /**
   * Previous day's price of the token.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  prevDayPx: string;
  /** Genesis data for the token. */
  genesis: {
    /** User balances. */
    userBalances: [
      /** @pattern ^0x[a-fA-F0-9]{40}$ */
      address: `0x${string}`,
      /** @pattern ^[0-9]+(\.[0-9]+)?$ */
      balance: string,
    ][];
    /** Existing token balances. */
    existingTokenBalances: [
      token: number,
      /** @pattern ^[0-9]+(\.[0-9]+)?$ */
      balance: string,
    ][];
    /**
     * Blacklisted users.
     * @pattern ^0x[a-fA-F0-9]{40}$
     */
    blacklistUsers: `0x${string}`[];
  } | null;
  /**
   * Deployer address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  deployer: `0x${string}` | null;
  /**
   * Gas used during token deployment.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  deployGas: string | null;
  /**
   * Timestamp of token deployment.
   * @pattern ^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$
   */
  deployTime: string | null;
  /**
   * Seeded USDC amount for the token.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  seededUsdc: string;
  /** Non-circulating user balances of the token. */
  nonCirculatingUserBalances: [
    /** @pattern ^0x[a-fA-F0-9]{40}$ */
    address: `0x${string}`,
    /** @pattern ^[0-9]+(\.[0-9]+)?$ */
    balance: string,
  ][];
  /**
   * Future emissions amount.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  futureEmissions: string;
};

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode tokenDetails} function. */
export type TokenDetailsParameters = Omit<v.InferInput<typeof TokenDetailsRequest>, "type">;

/**
 * Request token details.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Details of a token.
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
