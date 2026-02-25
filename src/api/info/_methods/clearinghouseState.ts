import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

/**
 * Request clearinghouse state.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
 */
export const ClearinghouseStateRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("clearinghouseState"),
    /** User address. */
    user: Address,
    /** DEX name (empty string for main dex). */
    dex: v.optional(v.string()),
  });
})();
export type ClearinghouseStateRequest = v.InferOutput<typeof ClearinghouseStateRequest>;

/**
 * Account summary for perpetual trading.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
 */
export type ClearinghouseStateResponse = {
  /** Margin summary details. */
  marginSummary: {
    /**
     * Total account value.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    accountValue: string;
    /**
     * Total notional position value.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    totalNtlPos: string;
    /**
     * Total raw USD value.
     * @pattern ^-?[0-9]+(\.[0-9]+)?$
     */
    totalRawUsd: string;
    /**
     * Total margin used.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    totalMarginUsed: string;
  };
  /** Cross-margin summary details. */
  crossMarginSummary: {
    /**
     * Total account value.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    accountValue: string;
    /**
     * Total notional position value.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    totalNtlPos: string;
    /**
     * Total raw USD value.
     * @pattern ^-?[0-9]+(\.[0-9]+)?$
     */
    totalRawUsd: string;
    /**
     * Total margin used.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    totalMarginUsed: string;
  };
  /**
   * Maintenance margin used for cross-margin positions.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  crossMaintenanceMarginUsed: string;
  /**
   * Amount available for withdrawal.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  withdrawable: string;
  /** Array of asset positions. */
  assetPositions: {
    /** Position type. */
    type: "oneWay";
    /** Position details. */
    position: {
      /** Asset symbol. */
      coin: string;
      /**
       * Signed position size.
       * @pattern ^-?[0-9]+(\.[0-9]+)?$
       */
      szi: string;
      /** Leverage details. */
      leverage: {
        /** Leverage type. */
        type: "isolated";
        /** Leverage value used. */
        value: number;
        /**
         * Amount of USD used (1 = $1).
         * @pattern ^-?[0-9]+(\.[0-9]+)?$
         */
        rawUsd: string;
      } | {
        /** Leverage type. */
        type: "cross";
        /** Leverage value used. */
        value: number;
      };
      /**
       * Average entry price.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      entryPx: string;
      /**
       * Position value.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      positionValue: string;
      /**
       * Unrealized profit and loss.
       * @pattern ^-?[0-9]+(\.[0-9]+)?$
       */
      unrealizedPnl: string;
      /**
       * Return on equity.
       * @pattern ^-?[0-9]+(\.[0-9]+)?$
       */
      returnOnEquity: string;
      /**
       * Liquidation price.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      liquidationPx: string | null;
      /**
       * Margin used.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      marginUsed: string;
      /** Maximum allowed leverage. */
      maxLeverage: number;
      /** Cumulative funding details. */
      cumFunding: {
        /**
         * Total funding paid or received since account opening.
         * @pattern ^-?[0-9]+(\.[0-9]+)?$
         */
        allTime: string;
        /**
         * Funding accumulated since the position was opened.
         * @pattern ^-?[0-9]+(\.[0-9]+)?$
         */
        sinceOpen: string;
        /**
         * Funding accumulated since the last change in position size.
         * @pattern ^-?[0-9]+(\.[0-9]+)?$
         */
        sinceChange: string;
      };
    };
  }[];
  /** Timestamp when data was retrieved (in ms since epoch). */
  time: number;
};

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode clearinghouseState} function. */
export type ClearinghouseStateParameters = Omit<v.InferInput<typeof ClearinghouseStateRequest>, "type">;

/**
 * Request clearinghouse state.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Account summary for perpetual trading.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { clearinghouseState } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await clearinghouseState(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
 */
export function clearinghouseState(
  config: InfoConfig,
  params: ClearinghouseStateParameters,
  signal?: AbortSignal,
): Promise<ClearinghouseStateResponse> {
  const request = v.parse(ClearinghouseStateRequest, {
    type: "clearinghouseState",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
