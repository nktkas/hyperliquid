import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request validator L1 votes.
 * @see null
 */
export const ValidatorL1VotesRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("validatorL1Votes"),
  });
})();
export type ValidatorL1VotesRequest = v.InferOutput<typeof ValidatorL1VotesRequest>;

/**
 * Array of L1 governance votes cast by validators.
 * @see null
 */
export type ValidatorL1VotesResponse = {
  /** Timestamp when the vote expires (in ms since epoch). */
  expireTime: number;
  /** Type of the vote. */
  action: {
    /**
     * Governance vote variant.
     *
     * FIXME: meaning unconfirmed.
     */
    D: string;
  } | {
    /**
     * Governance vote variant.
     *
     * FIXME: meaning unconfirmed.
     */
    C: string[];
  } | {
    /** Outcome market governance action. */
    O: {
      /** Register tokens and a standalone outcome. */
      registerTokensAndStandaloneOutcome: {
        /** Quote token identifier. */
        quoteToken: number;
        /** Token name and description. */
        nameAndDescription: [string, string];
      };
    } | {
      /** Register tokens and a question. */
      registerTokensAndQuestion: {
        /** Quote token identifier. */
        quoteToken: number;
        /** Question name and description. */
        questionNameAndDescription: [string, string];
        /** Fallback name and description. */
        fallbackNameAndDescription: [string, string];
        /** Named outcomes (name and description). */
        namedOutcomes: [string, string][];
      };
    } | {
      /** Settle an outcome. */
      settleOutcome: {
        /** Outcome identifier. */
        outcome: number;
        /**
         * Settlement fraction.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        settleFraction: string;
        /** Settlement details. */
        details: string;
      };
    } | {
      /** Settle a question across its named outcomes. */
      settleQuestion: {
        /** Question identifier. */
        question: number;
        /** Settlement fraction and details per outcome. */
        settleFractionsAndDetails: [
          /** Outcome identifier. */
          outcome: number,
          /** Settlement fraction and details. */
          fractionAndDetails: [
            /**
             * Settlement fraction.
             * @pattern ^[0-9]+(\.[0-9]+)?$
             */
            settleFraction: string,
            /** Settlement details. */
            details: string,
          ],
        ][];
      };
    };
  } | {
    /** Token and treasury governance action. */
    E: {
      /** Token identifier. */
      token: number;
      /**
       * Technical staker address.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      technicalStaker: `0x${string}`;
      /**
       * Treasury staker address.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      treasuryStaker: `0x${string}`;
      /**
       * Treasury EVM address.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      treasuryEvmAddress: `0x${string}`;
      /**
       * EVM rebalance contract address.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      evmRebalanceContract: `0x${string}`;
    };
  };
  /**
   * List of validator addresses that cast this vote.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  votes: `0x${string}`[];
  /** Whether the vote reached quorum. */
  quorumReached: boolean;
}[];

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/mod.ts";

/**
 * Request validator L1 votes.
 *
 * @param config General configuration for Info API requests.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Array of L1 governance votes cast by validators.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { validatorL1Votes } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await validatorL1Votes({ transport });
 * ```
 *
 * @see null
 */
export function validatorL1Votes(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<ValidatorL1VotesResponse> {
  const request = parse(ValidatorL1VotesRequest, {
    type: "validatorL1Votes",
  });
  return config.transport.request("info", request, signal);
}
