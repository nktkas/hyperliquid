import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request spot trading metadata.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata
 */
export const SpotMetaRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("spotMeta"),
  });
})();
export type SpotMetaRequest = v.InferOutput<typeof SpotMetaRequest>;

/**
 * Metadata for spot assets.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata
 */
export type SpotMetaResponse = {
  /** Trading universes available for spot trading. */
  universe: {
    /** Token indices included in this universe. */
    tokens: number[];
    /** Name of the universe. */
    name: string;
    /** Unique identifier of the universe. */
    index: number;
    /** Indicates if the token is the primary representation in the system. */
    isCanonical: boolean;
  }[];
  /** Tokens available for spot trading. */
  tokens: {
    /** Name of the token. */
    name: string;
    /** Minimum decimal places for order sizes. */
    szDecimals: number;
    /** Number of decimals for the token's smallest unit. */
    weiDecimals: number;
    /** Unique identifier for the token. */
    index: number;
    /**
     * Token ID.
     * @pattern ^0[xX][0-9a-fA-F]{32}$
     */
    tokenId: `0x${string}`;
    /** Indicates if the token is the primary representation in the system. */
    isCanonical: boolean;
    /** EVM contract details. */
    evmContract: {
      /**
       * Contract address.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      address: `0x${string}`;
      /** Extra decimals in the token's smallest unit. */
      evm_extra_wei_decimals: number;
    } | null;
    /** Full display name of the token. */
    fullName: string | null;
    /**
     * Deployer trading fee share for the token.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    deployerTradingFeeShare: string;
  }[];
  /** Outcome markets available for spot trading. */
  outcomes?: {
    /** Unique identifier of the outcome market. */
    outcome: number;
    /** Short name of the outcome market. */
    name: string;
    /** Description of the outcome market. */
    description: string;
    /** Token specifications for each side of the outcome market. */
    sideSpecs: {
      /** Side name (e.g., "YES", "NO"). */
      name: string;
      /** Spot token index corresponding to this side. */
      token: number;
    }[];
  }[];
  /** Questions for prediction markets. */
  questions?: {
    /** Unique identifier of the question. */
    question: number;
    /** Short name of the question. */
    name: string;
    /** Description of the question. */
    description: string;
    /** Default outcome index if the question is not resolved. */
    fallbackOutcome: number;
    /** Outcome indices associated with this question. */
    namedOutcomes: number[];
  }[];
};

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request spot trading metadata.
 *
 * @param config General configuration for Info API requests.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Metadata for spot assets.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { spotMeta } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await spotMeta({ transport });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata
 */
export function spotMeta(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<SpotMetaResponse> {
  const request = v.parse(SpotMetaRequest, {
    type: "spotMeta",
  });
  return config.transport.request("info", request, signal);
}
