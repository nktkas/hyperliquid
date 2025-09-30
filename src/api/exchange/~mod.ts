/**
 * This module re-exports all exchange-related API request functions and types.
 *
 * You can use raw functions to maximize tree-shaking in your app,
 * or to access [valibot](https://github.com/fabian-hiller/valibot) schemas Request/Response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 * import { order } from "@nktkas/hyperliquid/api/exchange";
 * //       ^^^^^
 * //       same name as in `ExchangeClient`
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await order(
 *   { transport, wallet }, // same params as in `ExchangeClient` or `MultiSignClient`
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

export { parser, SchemaError } from "../_common.ts";
export type { ExchangeRequestConfig } from "./_common.ts";

export * from "./approveAgent.ts";
export * from "./approveBuilderFee.ts";
export * from "./batchModify.ts";
export * from "./cancel.ts";
export * from "./cancelByCloid.ts";
export * from "./cDeposit.ts";
export * from "./claimRewards.ts";
export * from "./convertToMultiSigUser.ts";
export * from "./createSubAccount.ts";
export * from "./createVault.ts";
export * from "./cSignerAction.ts";
export * from "./cValidatorAction.ts";
export * from "./cWithdraw.ts";
export * from "./evmUserModify.ts";
export * from "./modify.ts";
export * from "./multiSig.ts";
export * from "./order.ts";
export * from "./noop.ts";
export * from "./perpDeploy.ts";
export * from "./registerReferrer.ts";
export * from "./reserveRequestWeight.ts";
export * from "./scheduleCancel.ts";
export * from "./sendAsset.ts";
export * from "./setDisplayName.ts";
export * from "./setReferrer.ts";
export * from "./spotDeploy.ts";
export * from "./spotSend.ts";
export * from "./spotUser.ts";
export * from "./subAccountModify.ts";
export * from "./subAccountSpotTransfer.ts";
export * from "./subAccountTransfer.ts";
export * from "./tokenDelegate.ts";
export * from "./twapCancel.ts";
export * from "./twapOrder.ts";
export * from "./updateIsolatedMargin.ts";
export * from "./updateLeverage.ts";
export * from "./usdClassTransfer.ts";
export * from "./usdSend.ts";
export * from "./vaultDistribute.ts";
export * from "./vaultModify.ts";
export * from "./vaultTransfer.ts";
export * from "./withdraw3.ts";
