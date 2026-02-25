/**
 * This module re-exports all exchange-related API request functions and types.
 *
 * You can use raw functions to maximize tree-shaking in your app,
 * or to access {@link https://github.com/fabian-hiller/valibot | valibot} schemas Request/Response.
 *
 * @example
 * ```ts
 * import { privateKeyToAccount } from "npm:viem/accounts";
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { order } from "@nktkas/hyperliquid/api/exchange";
 * //       ^^^^^
 * //       same name as in `ExchangeClient`
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await order(
 *   { transport, wallet }, // same params as in `ExchangeClient`
 *   {
 *     orders: [
 *       {
 *         a: 0,
 *         b: true,
 *         p: "30000",
 *         s: "0.1",
 *         r: false,
 *         t: { limit: { tif: "Gtc" } },
 *         c: "0x...",
 *       },
 *     ],
 *     grouping: "na",
 *   },
 * );
 * ```
 *
 * @module
 */

export { ApiRequestError } from "./_methods/_base/errors.ts";
export type { ExchangeMultiSigConfig, ExchangeSingleWalletConfig } from "./_methods/_base/execute.ts";

export * from "./_methods/agentEnableDexAbstraction.ts";
export * from "./_methods/agentSetAbstraction.ts";
export * from "./_methods/approveAgent.ts";
export * from "./_methods/approveBuilderFee.ts";
export * from "./_methods/batchModify.ts";
export * from "./_methods/borrowLend.ts";
export * from "./_methods/cancel.ts";
export * from "./_methods/cancelByCloid.ts";
export * from "./_methods/cDeposit.ts";
export * from "./_methods/claimRewards.ts";
export * from "./_methods/convertToMultiSigUser.ts";
export * from "./_methods/createSubAccount.ts";
export * from "./_methods/createVault.ts";
export * from "./_methods/cSignerAction.ts";
export * from "./_methods/cValidatorAction.ts";
export * from "./_methods/cWithdraw.ts";
export * from "./_methods/evmUserModify.ts";
export * from "./_methods/linkStakingUser.ts";
export * from "./_methods/modify.ts";
export * from "./_methods/noop.ts";
export * from "./_methods/order.ts";
export * from "./_methods/perpDeploy.ts";
export * from "./_methods/registerReferrer.ts";
export * from "./_methods/reserveRequestWeight.ts";
export * from "./_methods/scheduleCancel.ts";
export * from "./_methods/sendAsset.ts";
export * from "./_methods/setDisplayName.ts";
export * from "./_methods/setReferrer.ts";
export * from "./_methods/spotDeploy.ts";
export * from "./_methods/spotSend.ts";
export * from "./_methods/spotUser.ts";
export * from "./_methods/subAccountModify.ts";
export * from "./_methods/subAccountSpotTransfer.ts";
export * from "./_methods/subAccountTransfer.ts";
export * from "./_methods/tokenDelegate.ts";
export * from "./_methods/twapCancel.ts";
export * from "./_methods/twapOrder.ts";
export * from "./_methods/updateIsolatedMargin.ts";
export * from "./_methods/updateLeverage.ts";
export * from "./_methods/usdClassTransfer.ts";
export * from "./_methods/usdSend.ts";
export * from "./_methods/userDexAbstraction.ts";
export * from "./_methods/userPortfolioMargin.ts";
export * from "./_methods/userSetAbstraction.ts";
export * from "./_methods/validatorL1Stream.ts";
export * from "./_methods/vaultDistribute.ts";
export * from "./_methods/vaultModify.ts";
export * from "./_methods/vaultTransfer.ts";
export * from "./_methods/withdraw3.ts";
