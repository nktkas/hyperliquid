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
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("tokenDetails"),
        v.description("Type of request."),
      ),
      /** Token ID. */
      tokenId: v.pipe(
        Hex,
        v.length(34),
        v.description("Token ID."),
      ),
    }),
    v.description("Request token details."),
  );
})();
export type TokenDetailsRequest = v.InferOutput<typeof TokenDetailsRequest>;

/**
 * Details of a token.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-a-token
 */
export const TokenDetailsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Name of the token. */
      name: v.pipe(
        v.string(),
        v.description("Name of the token."),
      ),
      /** Maximum supply of the token. */
      maxSupply: v.pipe(
        UnsignedDecimal,
        v.description("Maximum supply of the token."),
      ),
      /** Total supply of the token. */
      totalSupply: v.pipe(
        UnsignedDecimal,
        v.description("Total supply of the token."),
      ),
      /** Circulating supply of the token. */
      circulatingSupply: v.pipe(
        UnsignedDecimal,
        v.description("Circulating supply of the token."),
      ),
      /** Decimal places for the minimum tradable unit. */
      szDecimals: v.pipe(
        UnsignedInteger,
        v.description("Decimal places for the minimum tradable unit."),
      ),
      /** Decimal places for the token's smallest unit. */
      weiDecimals: v.pipe(
        UnsignedInteger,
        v.description("Decimal places for the token's smallest unit."),
      ),
      /** Mid price of the token. */
      midPx: v.pipe(
        UnsignedDecimal,
        v.description("Mid price of the token."),
      ),
      /** Mark price of the token. */
      markPx: v.pipe(
        UnsignedDecimal,
        v.description("Mark price of the token."),
      ),
      /** Previous day's price of the token. */
      prevDayPx: v.pipe(
        UnsignedDecimal,
        v.description("Previous day's price of the token."),
      ),
      /** Genesis data for the token. */
      genesis: v.pipe(
        v.nullable(
          v.object({
            /** User balances. */
            userBalances: v.pipe(
              v.array(v.tuple([Address, v.string()])),
              v.description("User balances."),
            ),
            /** Existing token balances. */
            existingTokenBalances: v.pipe(
              v.array(v.tuple([UnsignedInteger, v.string()])),
              v.description("Existing token balances."),
            ),
            /** Blacklisted users. */
            blacklistUsers: v.pipe(
              v.array(Address),
              v.description("Blacklisted users."),
            ),
          }),
        ),
        v.description("Genesis data for the token."),
      ),
      /** Deployer address. */
      deployer: v.pipe(
        v.nullable(Address),
        v.description("Deployer address."),
      ),
      /** Gas used during token deployment. */
      deployGas: v.pipe(
        v.nullable(UnsignedDecimal),
        v.description("Gas used during token deployment."),
      ),
      /** Deployment time. */
      deployTime: v.pipe(
        v.nullable(v.string()),
        v.description("Deployment time."),
      ),
      /** Seeded USDC amount for the token. */
      seededUsdc: v.pipe(
        UnsignedDecimal,
        v.description("Seeded USDC amount for the token."),
      ),
      /** Non-circulating user balances of the token. */
      nonCirculatingUserBalances: v.pipe(
        v.array(v.tuple([Address, v.string()])),
        v.description("Non-circulating user balances of the token."),
      ),
      /** Future emissions amount. */
      futureEmissions: v.pipe(
        UnsignedDecimal,
        v.description("Future emissions amount."),
      ),
    }),
    v.description("Details of a token."),
  );
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
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
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
