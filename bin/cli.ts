#!/usr/bin/env node
// deno-lint-ignore-file no-console

/**
 * Command-line interface for interacting with Hyperliquid API.
 *
 * @example
 * ```sh
 * npx @nktkas/hyperliquid <endpoint> <method> [options]
 * ```
 *
 * @example Info Endpoint
 * ```sh
 * npx @nktkas/hyperliquid info clearinghouseState --user 0x...
 * ```
 *
 * @example Exchange Endpoint
 * ```sh
 * npx @nktkas/hyperliquid exchange withdraw3 --private-key 0x... --destination 0x... --amount 100.5
 * ```
 */

// @ts-ignore: Ignore missing TS types when building npm
import process from "node:process";
import { bold, dim } from "@std/fmt/colors";
import { type Args, extractArgs, transformArgs } from "./_utils.ts";
import { ExchangeClient, HttpTransport, InfoClient } from "../src/mod.ts";
import { PrivateKeySigner } from "../src/signing/mod.ts";

// ============================================================
// Execute
// ============================================================

/**
 * Transport that echoes the request payload instead of sending it to the server.
 * Used for offline mode to generate transactions without broadcasting them.
 */
class EchoTransport extends HttpTransport {
  override request<T>(_: string, payload: unknown): Promise<T> {
    return Promise.resolve({ status: "ok", response: payload } as T);
  }
}

/** Execute CLI command on info/exchange endpoint. */
async function executeEndpointMethod(endpoint: string, method: string, args: Args<false>): Promise<unknown> {
  // Parse CLI flags
  const isTestnet = "testnet" in args;
  const isOffline = "offline" in args;
  const timeout = args.timeout ? Number(args.timeout) : undefined;

  // Select transport: EchoTransport for offline mode, HttpTransport for real requests
  const transport = isOffline ? new EchoTransport({ isTestnet }) : new HttpTransport({ isTestnet, timeout });
  let client: InfoClient | ExchangeClient;

  // Initialize the appropriate client based on endpoint type
  switch (endpoint) {
    case "info":
      // InfoClient requires no authentication
      client = new InfoClient({ transport });
      break;
    case "exchange": {
      // ExchangeClient requires a private key for signing transactions
      const wallet = new PrivateKeySigner(args["private-key"] as `0x${string}`);
      delete args["private-key"]; // Remove sensitive data before passing args to method
      const defaultVaultAddress = args.vault as `0x${string}` | undefined;
      client = new ExchangeClient({ transport, wallet, defaultVaultAddress });
      break;
    }
    default:
      throw new Error(`Invalid endpoint "${endpoint}". Use "info" or "exchange"`);
  }

  // Validate that the requested method exists on the client
  if (!(method in client)) {
    throw new Error(`Unknown "${method}" method for "${endpoint}" endpoint`);
  }

  // Execute the method with remaining args as parameters
  // @ts-expect-error: dynamic method access
  const response = await client[method](args);

  // For offline mode, return the request payload instead of the wrapper
  return isOffline ? response.response : response;
}

// ============================================================
// CLI
// ============================================================

/** Prints CLI help message with usage instructions, available endpoints, methods, and examples. */
// deno-fmt-ignore
function printHelp(): void {
  // Color scheme: Minimal (git-style)
  // Respect NO_COLOR standard (https://no-color.org/)
  const noColor = "NO_COLOR" in process.env;
  const title = noColor ? (s: string) => s : (s: string) => bold(s);
  const separator = noColor ? (s: string) => s : (s: string) => dim(s);
  const sectionHeader = noColor ? (s: string) => s : (s: string) => bold(s);
  const category = noColor ? (s: string) => s : (s: string) => bold(s);
  const method = (s: string) => s;
  const params = noColor ? (s: string) => s : (s: string) => dim(s);
  const flag = noColor ? (s: string) => s : (s: string) => bold(s);
  const desc = noColor ? (s: string) => s : (s: string) => dim(s);
  const comment = noColor ? (s: string) => s : (s: string) => dim(s);
  const cmd = (s: string) => s;
  const label = noColor ? (s: string) => s : (s: string) => dim(s);

  const sep = separator("=".repeat(77));

  console.log(`${title("Hyperliquid CLI")}

${label("Usage:")}
  ${cmd("npx @nktkas/hyperliquid")} ${params("<endpoint> <method> [options]")}

${label("Endpoints:")}
  ${flag("info")}      ${desc("- Query blockchain and market information")}
  ${flag("exchange")}  ${desc("- Execute trading operations (requires")} ${flag("--private-key")}${desc(")")}

${label("Common Options:")}
  ${flag("--testnet")}            ${desc("Use testnet instead of mainnet")}
  ${flag("--timeout")} ${params("<number>")}   ${desc("Request timeout in milliseconds (default: 10000)")}
  ${flag("--help")}, ${flag("-h")}           ${desc("Show this help message")}
  ${flag("--offline")}            ${desc("Generate transactions offline without broadcasting")}

${label("Exchange Options:")}
  ${flag("--private-key")} ${params("<key>")}  ${desc("Private key for exchange operations (required)")}
  ${flag("--vault")} ${params("<address>")}    ${desc("Vault address for operations")}

${sep}
${sectionHeader("INFO ENDPOINT METHODS")}
${sep}

${category("Market Data:")}
  ${method("alignedQuoteTokenInfo")}   ${params("--token <number>")}
  ${method("allMids")}                 ${params("[--dex <string>]")}
  ${method("allPerpMetas")}            ${params("(no params)")}
  ${method("candleSnapshot")}          ${params("--coin <string> --interval <1m|3m|5m|15m|30m|1h|2h|4h|8h|12h|1d|3d|1w|1M>")}
                          ${params("--startTime <number> [--endTime <number>]")}
  ${method("fundingHistory")}          ${params("--coin <string> --startTime <number> [--endTime <number>]")}
  ${method("l2Book")}                  ${params("--coin <string> [--nSigFigs <2|3|4|5>] [--mantissa <2|5>]")}
  ${method("liquidatable")}            ${params("(no params)")}
  ${method("marginTable")}             ${params("--id <number>")}
  ${method("maxMarketOrderNtls")}      ${params("(no params)")}
  ${method("meta")}                    ${params("[--dex <string>]")}
  ${method("metaAndAssetCtxs")}        ${params("[--dex <string>]")}
  ${method("perpsAtOpenInterestCap")}  ${params("[--dex <string>]")}
  ${method("predictedFundings")}       ${params("(no params)")}
  ${method("recentTrades")}            ${params("--coin <string>")}
  ${method("spotMeta")}                ${params("(no params)")}
  ${method("spotMetaAndAssetCtxs")}    ${params("(no params)")}

${category("User Account:")}
  ${method("activeAssetData")}              ${params("--user <address> --coin <string>")}
  ${method("clearinghouseState")}           ${params("--user <address> [--dex <string>]")}
  ${method("extraAgents")}                  ${params("--user <address>")}
  ${method("isVip")}                        ${params("--user <address>")}
  ${method("legalCheck")}                   ${params("--user <address>")}
  ${method("maxBuilderFee")}                ${params("--user <address> --builder <address>")}
  ${method("portfolio")}                    ${params("--user <address>")}
  ${method("preTransferCheck")}             ${params("--user <address> --source <address>")}
  ${method("referral")}                     ${params("--user <address>")}
  ${method("spotClearinghouseState")}       ${params("--user <address> [--dex <string>]")}
  ${method("subAccounts")}                  ${params("--user <address>")}
  ${method("subAccounts2")}                 ${params("--user <address>")}
  ${method("userDexAbstraction")}           ${params("--user <address>")}
  ${method("userFees")}                     ${params("--user <address>")}
  ${method("userFunding")}                  ${params("--user <address> [--startTime <number>] [--endTime <number>]")}
  ${method("userNonFundingLedgerUpdates")}  ${params("--user <address> [--startTime <number>] [--endTime <number>]")}
  ${method("userRateLimit")}                ${params("--user <address>")}
  ${method("userRole")}                     ${params("--user <address>")}
  ${method("userToMultiSigSigners")}        ${params("--user <address>")}
  ${method("webData2")}                     ${params("--user <address>")}

${category("Orders & TWAP & Position:")}
  ${method("frontendOpenOrders")}        ${params("--user <address> [--dex <string>]")}
  ${method("historicalOrders")}          ${params("--user <address>")}
  ${method("openOrders")}                ${params("--user <address> [--dex <string>]")}
  ${method("orderStatus")}               ${params("--user <address> --oid <number|hex>")}
  ${method("twapHistory")}               ${params("--user <address>")}
  ${method("userFills")}                 ${params("--user <address> [--aggregateByTime <bool>]")}
  ${method("userFillsByTime")}           ${params("--user <address> --startTime <number>")}
                            ${params("[--endTime <number>] [--aggregateByTime <bool>]")}
  ${method("userTwapSliceFills")}        ${params("--user <address>")}
  ${method("userTwapSliceFillsByTime")}  ${params("--user <address> --startTime <number>")}
                            ${params("[--endTime <number>] [--aggregateByTime <bool>]")}

${category("Delegation & Validators:")}
  ${method("delegations")}         ${params("--user <address>")}
  ${method("delegatorHistory")}    ${params("--user <address>")}
  ${method("delegatorRewards")}    ${params("--user <address>")}
  ${method("delegatorSummary")}    ${params("--user <address>")}
  ${method("gossipRootIps")}       ${params("(no params)")}
  ${method("validatorL1Votes")}    ${params("(no params)")}
  ${method("validatorSummaries")}  ${params("(no params)")}

${category("Vault:")}
  ${method("leadingVaults")}      ${params("--user <address>")}
  ${method("userVaultEquities")}  ${params("--user <address>")}
  ${method("vaultDetails")}       ${params("--vaultAddress <address> [--user <address>]")}
  ${method("vaultSummaries")}     ${params("(no params)")}

${category("DEX:")}
  ${method("perpDexLimits")}  ${params("--dex <string>")}
  ${method("perpDexs")}       ${params("(no params)")}
  ${method("perpDexStatus")}  ${params("--dex <string>")}

${category("Deploy Market:")}
  ${method("perpDeployAuctionStatus")}       ${params("(no params)")}
  ${method("spotDeployState")}               ${params("--user <address>")}
  ${method("spotPairDeployAuctionStatus")}   ${params("(no params)")}

${category("Earn:")}
  ${method("allBorrowLendReserveStates")}  ${params("(no params)")}
  ${method("borrowLendReserveState")}      ${params("--token <number>")}
  ${method("borrowLendUserState")}         ${params("--user <address>")}
  ${method("userBorrowLendInterest")}      ${params("--user <address> --startTime <number> [--endTime <number>]")}

${category("Other:")}
  ${method("exchangeStatus")}  ${params("(no params)")}

${category("Transaction & Block Details:")}
  ${method("blockDetails")}  ${params("--height <number>")}
  ${method("tokenDetails")}  ${params("--tokenId <hex>")}
  ${method("txDetails")}     ${params("--hash <hex>")}
  ${method("userDetails")}   ${params("--user <address>")}

${sep}
${sectionHeader("EXCHANGE ENDPOINT METHODS")}
${sep}

${category("Order & TWAP & Position:")}
  ${method("batchModify")}           ${params("--modifies <json>")}
  ${method("cancel")}                ${params("--cancels <json>")}
  ${method("cancelByCloid")}         ${params("--cancels <json>")}
  ${method("modify")}                ${params("--oid <number|hex> --order <json>")}
  ${method("order")}                 ${params("--orders <json> [--grouping <na|normalTpsl|positionTpsl>] [--builder <json>]")}
  ${method("scheduleCancel")}        ${params("[--time <number>]")}
  ${method("twapCancel")}            ${params("--a <number> --t <number>")}
  ${method("twapOrder")}             ${params("--twap <json>")}
  ${method("updateIsolatedMargin")}  ${params("--asset <number> --isBuy <bool> --ntli <number>")}
  ${method("updateLeverage")}        ${params("--asset <number> --isCross <bool> --leverage <number>")}

${category("Account:")}
  ${method("agentEnableDexAbstraction")}  ${params("(no params)")}
  ${method("approveAgent")}               ${params("--agentAddress <address> [--agentName <string>]")}
  ${method("approveBuilderFee")}          ${params("--maxFeeRate <number> --builder <address>")}
  ${method("evmUserModify")}              ${params("--usingBigBlocks <bool>")}
  ${method("noop")}                       ${params("(no params)")}
  ${method("reserveRequestWeight")}       ${params("--weight <number>")}
  ${method("setDisplayName")}             ${params("--displayName <string>")}
  ${method("spotUser")}                   ${params("--toggleSpotDusting <json>")}
  ${method("userDexAbstraction")}         ${params("--user <address> --enabled <bool>")}
  ${method("userPortfolioMargin")}        ${params("--user <address> --enabled <bool>")}

${category("Fund Transfers:")}
  ${method("sendAsset")}         ${params("--destination <address> --token <name:address> --amount <number>")}
                    ${params("--sourceDex <string> --destinationDex <string> [--fromSubAccount <address>]")}
  ${method("spotSend")}          ${params("--destination <address> --token <name:address> --amount <number>")}
  ${method("usdClassTransfer")}  ${params("--amount <number> --toPerp <bool>")}
  ${method("usdSend")}           ${params("--destination <address> --amount <number>")}
  ${method("withdraw3")}         ${params("--destination <address> --amount <number>")}

${category("Sub-Account:")}
  ${method("createSubAccount")}        ${params("--name <string>")}
  ${method("subAccountModify")}        ${params("--subAccountUser <address> --name <string>")}
  ${method("subAccountSpotTransfer")}  ${params("--subAccountUser <address> --isDeposit <bool>")}
                          ${params("--token <name:address> --amount <number>")}
  ${method("subAccountTransfer")}      ${params("--subAccountUser <address> --isDeposit <bool> --usd <number>")}

${category("Referrer:")}
  ${method("claimRewards")}      ${params("(no params)")}
  ${method("registerReferrer")}  ${params("--code <string>")}
  ${method("setReferrer")}       ${params("--code <string>")}

${category("Staking & Delegation:")}
  ${method("cDeposit")}         ${params("--wei <number>")}
  ${method("cWithdraw")}        ${params("--wei <number>")}
  ${method("linkStakingUser")}  ${params("--user <address> --isFinalize <bool>")}
  ${method("tokenDelegate")}    ${params("--validator <address> --wei <number> --isUndelegate <bool>")}

${category("Vault:")}
  ${method("createVault")}      ${params("--name <string> --description <string> --initialUsd <number>")}
                   ${params("--nonce <number>")}
  ${method("vaultDistribute")}  ${params("--vaultAddress <address> --usd <number>")}
  ${method("vaultModify")}      ${params("--vaultAddress <address> [--allowDeposits <bool>]")}
                   ${params("[--alwaysCloseOnWithdraw <bool>]")}
  ${method("vaultTransfer")}    ${params("--vaultAddress <address> --isDeposit <bool> --usd <number>")}

${category("Deploy Market:")}
  ${method("perpDeploy")}  ${params("[--registerAsset2 <json>] [--registerAsset <json>]")}
              ${params("[--setOracle <json>] [--setFundingMultipliers <json>]")}
              ${params("[--haltTrading <json>] [--setMarginTableIds <json>]")}
              ${params("[--setFeeRecipient <json>] [--setOpenInterestCaps <json>]")}
              ${params("[--setSubDeployers <json>] [--setMarginModes <json>]")}
              ${params("[--setFeeScale <json>] [--setGrowthModes <json>]")}
  ${method("spotDeploy")}  ${params("[--registerToken2 <json>] [--userGenesis <json>]")}
              ${params("[--genesis <json>] [--registerSpot <json>]")}
              ${params("[--registerHyperliquidity <json>]")}
              ${params("[--setDeployerTradingFeeShare <json>]")}
              ${params("[--enableQuoteToken <json>] [--enableAlignedQuoteToken <json>]")}

${category("Validator Actions:")}
  ${method("cSignerAction")}      ${params("[--jailSelf <null>] [--unjailSelf <null>]")}
  ${method("cValidatorAction")}   ${params("[--changeProfile <json>] [--register <json>]")}
                     ${params("[--unregister <null>]")}
  ${method("validatorL1Stream")}  ${params("--riskFreeRate <number>")}

${category("Earn:")}
  ${method("borrowLend")}  ${params("--operation <supply|withdraw> --token <number> --amount <number|null>")}

${category("Other:")}
  ${method("convertToMultiSigUser")}  ${params("--signers <json>")}

${sep}

${label("Examples:")}
  ${comment("# Get all mid prices")}
  ${cmd("npx @nktkas/hyperliquid info allMids")}

  ${comment("# Get ETH order book with 3 significant figures")}
  ${cmd("npx @nktkas/hyperliquid info l2Book --coin ETH --nSigFigs 3")}

  ${comment("# Get user's portfolio")}
  ${cmd("npx @nktkas/hyperliquid info portfolio --user 0x...")}

  ${comment("# Get candle data for BTC")}
  ${cmd("npx @nktkas/hyperliquid info candleSnapshot --coin BTC --interval 1h --startTime 1700000000000")}

  ${comment("# Place a limit order")}
  ${cmd('npx @nktkas/hyperliquid exchange order --private-key 0x... --orders \'[{"a":0,"b":true,"p":30000,"s":0.1,"r":false,"t":{"limit":{"tif":"Gtc"}}}]\'')}

  ${comment("# Cancel orders")}
  ${cmd('npx @nktkas/hyperliquid exchange cancel --private-key 0x... --cancels \'[{"a":0,"o":12345}]\'')}

  ${comment("# Update leverage")}
  ${cmd("npx @nktkas/hyperliquid exchange updateLeverage --private-key 0x... --asset 0 --isCross true --leverage 5")}

  ${comment("# Withdraw funds")}
  ${cmd("npx @nktkas/hyperliquid exchange withdraw3 --private-key 0x... --destination 0x... --amount 100.5")}

  ${comment("# Send USD to another user")}
  ${cmd("npx @nktkas/hyperliquid exchange usdSend --private-key 0x... --destination 0x... --amount 50")}

  ${comment("# Create a vault")}
  ${cmd('npx @nktkas/hyperliquid exchange createVault --private-key 0x... --name "My Vault" --description "Test vault" --initialUsd 1000')}`);
}

// ============================================================
// Entry
// ============================================================

const rawArgs = extractArgs(process.argv.slice(2), { flags: ["testnet", "help", "h", "offline"], collect: false });
const args = transformArgs(rawArgs, { number: "string" });
const [endpoint, method] = args._;

if (args.help || args.h || !endpoint || !method) {
  printHelp();
} else {
  executeEndpointMethod(endpoint, method, args)
    .then((result) => console.log(JSON.stringify(result)))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
