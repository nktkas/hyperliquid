import * as hl from "@nktkas/hyperliquid";
import * as v from "valibot";
import { type Args, parseArgs, transformArgs } from "./_utils.ts";

// Hack to avoid `npm i --save-dev @types/node`
declare const process: {
  argv: string[];
};

function transformParams(method: string, params: Args) {
  switch (method) {
    case "spotUser": {
      return { toggleSpotDusting: { ...params } };
    }
    case "twapOrder": {
      return { twap: { ...params } };
    }
    default: {
      return params;
    }
  }
}

class EchoTransport implements hl.IRequestTransport {
  constructor(public isTestnet: boolean) {}
  request<T>(_: "info" | "exchange" | "explorer", payload: unknown): Promise<T> {
    return new Promise((resolve) => resolve({ status: "ok", response: payload } as T));
  }
}
async function executeEndpointMethod(
  endpoint: string,
  method: string,
  args: Args,
): Promise<unknown> {
  const isTestnet = "testnet" in args;
  const timeout = Number(args.timeout) || undefined;
  const isOffline = "offline" in args;

  const transport = isOffline ? new EchoTransport(isTestnet) : new hl.HttpTransport({ isTestnet, timeout });
  let client: hl.InfoClient | hl.ExchangeClient;

  if (endpoint === "info") {
    client = new hl.InfoClient({ transport });

    if (!(method in client)) {
      throw new Error(`CLI does not support the "${method}" method in the "${endpoint}" endpoint`);
    }
  } else if (endpoint === "exchange") {
    const pk = v.parse(
      v.pipe(v.string(), v.hexadecimal()),
      args["private-key"],
      { message: 'Invalid format "private-key": Expected 32-byte hexadecimal string' },
    );
    delete args["private-key"]; // just in case

    const defaultVaultAddress = v.parse(
      v.optional(v.pipe(v.string(), v.hexadecimal())),
      args.vault,
      { message: 'Invalid format "vault": Expected 20-byte hexadecimal string OR nothing' },
    );

    client = new hl.ExchangeClient({ transport, wallet: pk, defaultVaultAddress });

    if (!(method in client)) {
      throw new Error(`CLI does not support the "${method}" method in the "${endpoint}" endpoint`);
    }
  } else {
    throw new Error(`Invalid endpoint "${endpoint}". Use "info" or "exchange"`);
  }

  if (isOffline) {
    // @ts-ignore - dynamic method access
    const response = await client[method](transformParams(method, args));
    return response.response;
  } else {
    // @ts-ignore - dynamic method access
    return await client[method](transformParams(method, args));
  }
}

// ──────────────────── Main ────────────────────

function printHelp() {
  console.log(`Hyperliquid CLI

Usage:
  npx @nktkas/hyperliquid <endpoint> <method> [options]

Endpoints:
  info      - Query blockchain and market information
  exchange  - Execute trading operations (requires --private-key)

Common Options:
  --testnet               Use testnet instead of mainnet
  --timeout <number>      Request timeout in milliseconds (default: 10000)
  --help, -h              Show this help message
  --offline               Generate transactions offline without broadcasting

Exchange Options:
  --private-key <key>     Private key for exchange operations (required)
  --vault <address>       Vault address for operations

=============================================================================
INFO ENDPOINT METHODS
=============================================================================

Market Data:
  alignedQuoteTokenInfo   --token <number>
  allMids                 [--dex <string>]
  allPerpMetas            (no params)
  candleSnapshot          --coin <string> --interval <1m|3m|5m|15m|30m|1h|2h|4h|8h|12h|1d|3d|1w|1M>
                          --startTime <number> [--endTime <number>]
  fundingHistory          --coin <string> --startTime <number> [--endTime <number>]
  l2Book                  --coin <string> [--nSigFigs <2|3|4|5>] [--mantissa <2|5>]
  liquidatable            (no params)
  marginTable             --id <number>
  maxMarketOrderNtls      (no params)
  meta                    [--dex <string>]
  metaAndAssetCtxs        [--dex <string>]
  perpDexLimits           --dex <string>
  perpDexs                (no params)
  perpsAtOpenInterestCap  [--dex <string>]
  predictedFundings       (no params)
  recentTrades            --coin <string>
  spotMeta                (no params)
  spotMetaAndAssetCtxs    (no params)

User Account:
  activeAssetData         --user <address> --coin <string>
  clearinghouseState      --user <address> [--dex <string>]
  extraAgents             --user <address>
  isVip                   --user <address>
  legalCheck              --user <address>
  maxBuilderFee           --user <address> --builder <address>
  portfolio               --user <address>
  preTransferCheck        --user <address> --source <address>
  referral                --user <address>
  spotClearinghouseState  --user <address> [--dex <string>]
  subAccounts             --user <address>
  subAccounts2            --user <address>
  userDexAbstraction      --user <address>
  userFees                --user <address>
  userFunding             --user <address> --startTime <number> [--endTime <number>]
  userNonFundingLedgerUpdates  --user <address> --startTime <number> [--endTime <number>]
  userRateLimit           --user <address>
  userRole                --user <address>
  userToMultiSigSigners   --user <address>
  webData2                --user <address>

Orders & TWAP & Position:
  frontendOpenOrders      --user <address> [--dex <string>]
  historicalOrders        --user <address>
  openOrders              --user <address> [--dex <string>]
  orderStatus             --user <address> --oid <number|hex>
  twapHistory             --user <address>
  userFills               --user <address> [--aggregateByTime <bool>]
  userFillsByTime         --user <address> --startTime <number>
                          [--endTime <number>] [--aggregateByTime <bool>]
  userTwapSliceFills           --user <address>
  userTwapSliceFillsByTime     --user <address> --startTime <number>
                               [--endTime <number>] [--aggregateByTime <bool>]

Delegation & Validators:
  delegations             --user <address>
  delegatorHistory        --user <address>
  delegatorRewards        --user <address>
  delegatorSummary        --user <address>
  gossipRootIps           (no params)
  validatorL1Votes        (no params)
  validatorSummaries      (no params)

Vault:
  leadingVaults           --user <address>
  userVaultEquities       --user <address>
  vaultDetails            --vaultAddress <address> [--user <address>]
  vaultSummaries          (no params)

Deploy Market:
  perpDeployAuctionStatus      (no params)
  spotDeployState              --user <address>
  spotPairDeployAuctionStatus  (no params)

Other:
  exchangeStatus          (no params)

Transaction & Block Details:
  blockDetails            --height <number>
  tokenDetails            --tokenId <hex>
  txDetails               --hash <hex>
  userDetails             --user <address>

=============================================================================
EXCHANGE ENDPOINT METHODS
=============================================================================

Order & TWAP & Position:
  batchModify             --modifies <json>
  cancel                  --cancels <json>
  cancelByCloid           --cancels <json>
  modify                  --oid <number|hex> --order <json>
  order                   --orders <json> [--grouping <na|normalTpsl|positionTpsl>] [--builder <json>]
  scheduleCancel          [--time <number>]
  twapCancel              --a <number> --t <number>
  twapOrder               --a <number> --b <bool> --s <number> --r <bool> --m <number> --t <bool>
  updateIsolatedMargin    --asset <number> --isBuy <bool> --ntli <number>
  updateLeverage          --asset <number> --isCross <bool> --leverage <number>

Account:
  agentEnableDexAbstraction  (no params)
  approveAgent            --agentAddress <address> [--agentName <string>]
  approveBuilderFee       --maxFeeRate <number> --builder <address>
  evmUserModify           --usingBigBlocks <bool>
  noop                    (no params)
  reserveRequestWeight    --weight <number>
  setDisplayName          --displayName <string>
  spotUser                --optOut <bool>
  userDexAbstraction      --user <address> --enabled <bool>

Fund Transfers:
  sendAsset               --destination <address> --token <name:address> --amount <number>
                          --sourceDex <string> --destinationDex <string> [--fromSubAccount <address>]
  spotSend                --destination <address> --token <name:address> --amount <number>
  usdClassTransfer        --amount <number> --toPerp <bool>
  usdSend                 --destination <address> --amount <number>
  withdraw3               --destination <address> --amount <number>

Sub-Account:
  createSubAccount        --name <string>
  subAccountModify        --subAccountUser <address> --name <string>
  subAccountSpotTransfer  --subAccountUser <address> --isDeposit <bool>
                          --token <name:address> --amount <number>
  subAccountTransfer      --subAccountUser <address> --isDeposit <bool> --usd <number>

Referrer:
  claimRewards            (no params)
  registerReferrer        --code <string>
  setReferrer             --code <string>

Staking & Delegation:
  cDeposit                --wei <number>
  cWithdraw               --wei <number>
  linkStakingUser         --user <address> --isFinalize <bool>
  tokenDelegate           --validator <address> --wei <number> --isUndelegate <bool>

Vault:
  createVault             --name <string> --description <string> --initialUsd <number>
  vaultDistribute         --vaultAddress <address> --usd <number>
  vaultModify             --vaultAddress <address> [--allowDeposits <bool>]
                          [--alwaysCloseOnWithdraw <bool>]
  vaultTransfer           --vaultAddress <address> --isDeposit <bool> --usd <number>

Deploy Market:
  perpDeploy              --registerAsset <json> | --setOracle <json> | --setFundingMultipliers <json> |
                          --haltTrading <json> | --setMarginTableIds <json> | --setFeeRecipient <json> |
                          --setOpenInterestCaps <json>
  spotDeploy              --genesis <json> | --registerHyperliquidity <json> | --registerSpot <json> |
                          --registerToken2 <json> | --setDeployerTradingFeeShare <json> | --userGenesis <json> |
                          --enableQuoteToken <json>

Validator Actions:
  cSignerAction           --jailSelf null | --unjailSelf null
  cValidatorAction        --changeProfile <json> | --register <json> | --unregister null

Other:
  convertToMultiSigUser   --authorizedUsers <json> --threshold <number>

=============================================================================

Examples:
  # Get all mid prices
  npx @nktkas/hyperliquid info allMids

  # Get ETH order book with 3 significant figures
  npx @nktkas/hyperliquid info l2Book --coin ETH --nSigFigs 3

  # Get user's portfolio
  npx @nktkas/hyperliquid info portfolio --user 0x...

  # Get candle data for BTC
  npx @nktkas/hyperliquid info candleSnapshot --coin BTC --interval 1h --startTime 1700000000000

  # Place a limit order
  npx @nktkas/hyperliquid exchange order --private-key 0x... --orders '[{\\"a\\":0,\\"b\\":true,\\"p\\":30000,\\"s\\":0.1,\\"r\\":false,\\"t\\":{\\"limit\\":{\\"tif\\":\\"Gtc\\"}}}]'

  # Modify an existing order
  npx @nktkas/hyperliquid exchange modify --private-key 0x... --oid 12345 --order '{\\"a\\":0,\\"b\\":true,\\"p\\":31000,\\"s\\":0.1,\\"r\\":false,\\"t\\":{\\"limit\\":{\\"tif\\":\\"Gtc\\"}}}'

  # Cancel orders
  npx @nktkas/hyperliquid exchange cancel --private-key 0x... --cancels '[{\\"a\\":0,\\"o\\":12345}]'

  # Update leverage
  npx @nktkas/hyperliquid exchange updateLeverage --private-key 0x... --asset 0 --isCross true --leverage 5

  # Withdraw funds
  npx @nktkas/hyperliquid exchange withdraw3 --private-key 0x... --destination 0x... --amount 100.5

  # Send USD to another user
  npx @nktkas/hyperliquid exchange usdSend --private-key 0x... --destination 0x... --amount 50

  # Create a vault
  npx @nktkas/hyperliquid exchange createVault --private-key 0x... --name "My Vault" --description "Test vault" --initialUsd 1000`);
}

const rawArgs = parseArgs(process.argv.slice(2), {
  flags: ["testnet", "help", "h", "offline"],
});
const args = transformArgs(rawArgs, {
  number: "string",
});
const [endpoint, method] = args._;

if (args.help || args.h || !endpoint || !method) {
  printHelp();
} else {
  executeEndpointMethod(endpoint, method, args)
    .then((result) => console.log(JSON.stringify(result)))
    .catch((error) => console.error("Error:", error instanceof Error ? error.message : String(error)));
}
