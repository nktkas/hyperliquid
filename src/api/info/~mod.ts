/**
 * This module re-exports all info-related API request functions and types.
 *
 * You can use raw functions to maximize tree-shaking in your app,
 * or to access [valibot](https://github.com/fabian-hiller/valibot) schemas Request/Response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { clearinghouseState } from "@nktkas/hyperliquid/api/info";
 * //       ^^^^^^^^^^^^^^^^^^
 * //       same name as in `InfoClient`
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await clearinghouseState(
 *   { transport }, // same params as in `InfoClient`
 *   { user: "0x..." },
 * );
 * ```
 *
 * @module
 */

export { parser, SchemaError } from "../_base.ts";
export type { InfoRequestConfig } from "./_base.ts";

export * from "./activeAssetData.ts";
export * from "./alignedQuoteTokenInfo.ts";
export * from "./allMids.ts";
export * from "./blockDetails.ts";
export * from "./candleSnapshot.ts";
export * from "./clearinghouseState.ts";
export * from "./delegations.ts";
export * from "./delegatorHistory.ts";
export * from "./delegatorRewards.ts";
export * from "./delegatorSummary.ts";
export * from "./exchangeStatus.ts";
export * from "./extraAgents.ts";
export * from "./frontendOpenOrders.ts";
export * from "./fundingHistory.ts";
export * from "./gossipRootIps.ts";
export * from "./historicalOrders.ts";
export * from "./isVip.ts";
export * from "./l2Book.ts";
export * from "./leadingVaults.ts";
export * from "./legalCheck.ts";
export * from "./liquidatable.ts";
export * from "./marginTable.ts";
export * from "./maxBuilderFee.ts";
export * from "./maxMarketOrderNtls.ts";
export * from "./meta.ts";
export * from "./metaAndAssetCtxs.ts";
export * from "./openOrders.ts";
export * from "./orderStatus.ts";
export * from "./perpDeployAuctionStatus.ts";
export * from "./perpDexLimits.ts";
export * from "./perpDexs.ts";
export * from "./perpsAtOpenInterestCap.ts";
export * from "./portfolio.ts";
export * from "./predictedFundings.ts";
export * from "./preTransferCheck.ts";
export * from "./recentTrades.ts";
export * from "./referral.ts";
export * from "./spotClearinghouseState.ts";
export * from "./spotDeployState.ts";
export * from "./spotMeta.ts";
export * from "./spotMetaAndAssetCtxs.ts";
export * from "./spotPairDeployAuctionStatus.ts";
export * from "./subAccounts.ts";
export * from "./tokenDetails.ts";
export * from "./twapHistory.ts";
export * from "./txDetails.ts";
export * from "./userDetails.ts";
export * from "./userFees.ts";
export * from "./userFills.ts";
export * from "./userFillsByTime.ts";
export * from "./userFunding.ts";
export * from "./userNonFundingLedgerUpdates.ts";
export * from "./userRateLimit.ts";
export * from "./userRole.ts";
export * from "./userToMultiSigSigners.ts";
export * from "./userTwapSliceFills.ts";
export * from "./userTwapSliceFillsByTime.ts";
export * from "./userVaultEquities.ts";
export * from "./validatorL1Votes.ts";
export * from "./validatorSummaries.ts";
export * from "./vaultDetails.ts";
export * from "./vaultSummaries.ts";
export * from "./webData2.ts";
