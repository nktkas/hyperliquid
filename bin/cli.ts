#!/usr/bin/env node
import * as hl from "@nktkas/hyperliquid";
import { Hex } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import parseArgs from "minimist";
import process from "node:process";

type MethodNames<T> = {
    // deno-lint-ignore no-explicit-any
    [K in Extract<keyof T, string>]: T[K] extends (...args: any[]) => any ? K : never;
}[Extract<keyof T, string>];
// deno-lint-ignore no-explicit-any
function getClassMethods<T>(classConstructor: new (...args: any[]) => T): MethodNames<T>[] {
    return Object.getOwnPropertyNames(classConstructor.prototype)
        .filter((name): name is string => {
            if (name === "constructor") return false;
            const descriptor = Object.getOwnPropertyDescriptor(classConstructor.prototype, name);
            return descriptor?.value && typeof descriptor.value === "function";
        }) as MethodNames<T>[];
}
// deno-lint-ignore no-explicit-any
function isClassMethod<T>(classConstructor: new (...args: any[]) => T, method: string): method is MethodNames<T> {
    const classMethods = getClassMethods(classConstructor);
    // deno-lint-ignore no-explicit-any
    return classMethods.includes(method as any);
}

function transformParams(method: string, params: Record<string, unknown>): Record<string, unknown> {
    switch (method) {
        case "cSignerAction": {
            return {
                ...params,
                jailSelf: "jailSelf" in params ? null : undefined,
                unjailSelf: "unjailSelf" in params ? null : undefined,
            };
        }
        case "spotUser": {
            return {
                toggleSpotDusting: {
                    ...params,
                },
            };
        }
        case "twapOrder": {
            return {
                twap: {
                    ...params,
                },
            };
        }
        case "cValidatorAction": {
            if ("unregister" in params) {
                return {
                    ...params,
                    unregister: null,
                };
            }
        }
        /* falls through */
        default: {
            return params;
        }
    }
}

class EchoTransport implements hl.IRequestTransport {
    constructor(public isTestnet: boolean) {}
    request<T>(endpoint: "info" | "exchange" | "explorer", payload: unknown): Promise<T> {
        if (endpoint === "explorer") {
            if (typeof payload === "object" && payload !== null && "type" in payload) {
                if (payload.type === "blockDetails") {
                    return new Promise((resolve) => resolve({ blockDetails: payload } as T));
                } else if (payload.type === "txDetails") {
                    return new Promise((resolve) => resolve({ tx: payload } as T));
                } else if (payload.type === "userDetails") {
                    return new Promise((resolve) => resolve({ txs: payload } as T));
                }
            }
        }
        return new Promise((resolve) => resolve(payload as T));
    }
}
class ExchangeClientWithoutValidation extends hl.ExchangeClient {
    override _validateResponse = () => true;
}

async function executeEndpointMethod(
    endpoint: string,
    method: string,
    cliArgs: Record<string, unknown>,
): Promise<unknown> {
    const isTestnet = Boolean(cliArgs?.testnet);
    const timeout = Number(cliArgs.timeout) || undefined;
    const isOffline = Boolean(cliArgs?.offline);

    const transport = isOffline ? new EchoTransport(isTestnet) : new hl.HttpTransport({ isTestnet, timeout });
    let client: hl.InfoClient | hl.ExchangeClient;

    if (endpoint === "info") {
        if (!isClassMethod(hl.InfoClient, method)) {
            throw new Error(`CLI does not support the "${method}" method in the "info" endpoint`);
        }

        client = new hl.InfoClient({ transport });
    } else if (endpoint === "exchange") {
        if (!isClassMethod(hl.ExchangeClient, method)) {
            throw new Error(`CLI does not support the "${method}" method in the "exchange" endpoint`);
        }

        const privateKey = v.parse(
            v.pipe(Hex, v.minLength(66)),
            cliArgs["private-key"],
            { message: 'Invalid format "private-key": Expected 32-byte hexadecimal string' },
        );
        delete cliArgs["private-key"]; // just in case
        const vaultAddress = v.parse(
            v.optional(v.pipe(Hex, v.minLength(42))),
            cliArgs.vault,
            { message: 'Invalid format "vault": Expected 20-byte hexadecimal string OR nothing' },
        );

        client = isOffline
            ? new ExchangeClientWithoutValidation({
                transport,
                wallet: privateKey,
                defaultVaultAddress: vaultAddress,
            })
            : new hl.ExchangeClient({
                transport,
                wallet: privateKey,
                defaultVaultAddress: vaultAddress,
            });
    } else {
        throw new Error(`Invalid endpoint "${endpoint}". Use "info" or "exchange"`);
    }

    // @ts-ignore - dynamic method access
    return await client[method](transformParams(method, cliArgs));
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
  allMids                 [--dex <string>]
  l2Book                  --coin <string> [--nSigFigs <2|3|4|5>] [--mantissa <2|5>]
  candleSnapshot          --coin <string> --interval <1m|3m|5m|15m|30m|1h|2h|4h|8h|12h|1d|3d|1w|1M> 
                          --startTime <number> [--endTime <number>]
  fundingHistory          --coin <string> --startTime <number> [--endTime <number>]
  predictedFundings       (no params)
  recentTrades            --coin <string>

Exchange Information:
  meta                    [--dex <string>]
  metaAndAssetCtxs        [--dex <string>]
  spotMeta                (no params)
  spotMetaAndAssetCtxs    (no params)
  exchangeStatus          (no params)
  perpDexs                (no params)
  perpDexLimits           --dex <string>
  spotPairDeployAuctionStatus  (no params)
  perpDeployAuctionStatus      (no params)
  perpsAtOpenInterestCap       [--dex <string>]
  maxMarketOrderNtls           (no params)
  liquidatable                 (no params)
  marginTable                  --id <number>

User Account Data:
  clearinghouseState      --user <address> [--dex <string>]
  spotClearinghouseState  --user <address> [--dex <string>]
  portfolio               --user <address>
  openOrders              --user <address> [--dex <string>]
  frontendOpenOrders      --user <address> [--dex <string>]
  historicalOrders        --user <address>
  orderStatus             --user <address> --oid <number|hex>
  userDetails             --user <address>
  userFees                --user <address>
  userRateLimit           --user <address>
  userRole                --user <address>
  activeAssetData         --user <address> --coin <string>
  isVip                   --user <address>
  legalCheck              --user <address>
  referral                --user <address>
  spotDeployState         --user <address>
  preTransferCheck        --user <address> --source <address>
  maxBuilderFee           --user <address> --builder <address>
  webData2                --user <address>

User Trading History:
  userFills               --user <address> [--aggregateByTime <bool>]
  userFillsByTime         --user <address> --startTime <number> [--endTime <number>] [--aggregateByTime <bool>]
  userFunding             --user <address> --startTime <number> [--endTime <number>]
  userNonFundingLedgerUpdates  --user <address> --startTime <number> [--endTime <number>]
  twapHistory             --user <address>
  userTwapSliceFills      --user <address>
  userTwapSliceFillsByTime     --user <address> --startTime <number> [--endTime <number>] [--aggregateByTime <bool>]

Sub-Account & Multi-Sig:
  subAccounts             --user <address>
  extraAgents             --user <address>
  userToMultiSigSigners   --user <address>

Vault Information:
  vaultSummaries          (no params)
  vaultDetails            --vaultAddress <address> [--user <address>]
  leadingVaults           --user <address>
  userVaultEquities       --user <address>

Delegation & Validators:
  delegations             --user <address>
  delegatorHistory        --user <address>
  delegatorRewards        --user <address>
  delegatorSummary        --user <address>
  validatorL1Votes        (no params)
  validatorSummaries      (no params)
  gossipRootIps           (no params)

Transaction & Block Details:
  txDetails               --hash <hex>
  blockDetails            --height <number>
  tokenDetails            --tokenId <hex>

=============================================================================
EXCHANGE ENDPOINT METHODS
=============================================================================

Trading Operations:
  order                   --orders <json> [--grouping <na|normalTpsl|positionTpsl>] 
                          [--builder <json>]
  modify                  --oid <number|hex> --order <json>
  batchModify             --modifies <json>
  cancel                  --cancels <json>
  cancelByCloid           --cancels <json>
  scheduleCancel          [--time <number>]

TWAP Operations:
  twapOrder               --a <number> --b <bool> --s <number> --r <bool> --m <number> --t <bool>
  twapCancel              --a <number> --t <number>

Position Management:
  updateLeverage          --asset <number> --isCross <bool> --leverage <number>
  updateIsolatedMargin    --asset <number> --isBuy <bool> --ntli <number>

Fund Transfers:
  withdraw3               --destination <address> --amount <number>
  usdSend                 --destination <address> --amount <number>
  spotSend                --destination <address> --token <name:address> --amount <number>
  sendAsset               --destination <address> --token <name:address> --amount <number>
                          --sourceDex <string> --destinationDex <string> [--fromSubAccount <address>]
  usdClassTransfer        --amount <number> --toPerp <bool>

Sub-Account Management:
  createSubAccount        --name <string>
  subAccountModify        --subAccountUser <address> --name <string>
  subAccountTransfer      --subAccountUser <address> --isDeposit <bool> --usd <number>
  subAccountSpotTransfer  --subAccountUser <address> --isDeposit <bool> 
                          --token <name:address> --amount <number>

Vault Operations:
  createVault             --name <string> --description <string> --initialUsd <number>
  vaultModify             --vaultAddress <address> [--allowDeposits <bool>] 
                          [--alwaysCloseOnWithdraw <bool>]
  vaultTransfer           --vaultAddress <address> --isDeposit <bool> --usd <number>
  vaultDistribute         --vaultAddress <address> --usd <number>

Agent & Referrer:
  approveAgent            --agentAddress <address> [--agentName <string>]
  approveBuilderFee       --maxFeeRate <number> --builder <address>
  registerReferrer        --code <string>
  setReferrer             --code <string>
  setDisplayName          --displayName <string>

Staking & Delegation:
  tokenDelegate           --validator <address> --wei <number> --isUndelegate <bool>
  cDeposit                --wei <number>
  cWithdraw               --wei <number>
  claimRewards            (no params)

Spot & EVM Operations:
  spotUser                --optOut <bool>
  evmUserModify           --usingBigBlocks <bool>
  reserveRequestWeight    --weight <number>

Deploy Market:
  perpDeploy              --registerAsset <json> | --setOracle <json>
  spotDeploy              --genesis <json> | --registerHyperliquidity <json> | --registerSpot <json> |
                          --registerToken2 <json> | --setDeployerTradingFeeShare <json> | --userGenesis <json>

Multi-Sig & Advanced:
  convertToMultiSigUser   --authorizedUsers <json> --threshold <number>
  cSignerAction           --jailSelf | --unjailSelf
  cValidatorAction        --changeProfile <json> | --register <json> | --unregister
  noop                    (no params)

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

type FindInArgvType = "hex" | "bool" | "number" | "empty" | "json_object" | "json_array";

function findInArgv(types: FindInArgvType[]): string[] {
    // Validation functions for each type
    const validators = {
        // to avoid converting them to numbers
        hex: (value: string) => /^0[xX][0-9a-fA-F]+$/.test(value),
        // to avoid converting them to strings
        bool: (value: string) => /^(true|false)$/i.test(value),
        // to avoid losing precision in fractional numbers
        number: (value: string) => /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(value),
        // to avoid converting them to booleans
        empty: (value: string) => value === "",
        json_object: (value: string) => {
            try {
                const parsed = JSON.parse(value);
                return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
            } catch {
                return false;
            }
        },
        json_array: (value: string) => {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed);
            } catch {
                return false;
            }
        },
    };

    const foundKeys = [];

    for (let i = 0; i < process.argv.length; i++) {
        const arg = process.argv[i];

        // Processing format --key=value
        if (arg.startsWith("--") && arg.includes("=")) {
            const eqIndex = arg.indexOf("=");
            const key = arg.slice(2, eqIndex);
            const value = arg.slice(eqIndex + 1);

            // Check value for all requested types
            for (const type of types) {
                if (validators[type] && validators[type](value)) {
                    foundKeys.push(key);
                    break; // Don't add duplicates
                }
            }
        } // Processing format --key value
        else if (arg.startsWith("--") && i + 1 < process.argv.length) {
            const nextArg = process.argv[i + 1];
            const key = arg.slice(2);

            // Check value for all requested types
            for (const type of types) {
                if (validators[type] && validators[type](nextArg)) {
                    foundKeys.push(key);
                    break; // Don't add duplicates
                }
            }
        }
    }

    return foundKeys;
}

const cliArgs = parseArgs(process.argv.slice(2), {
    boolean: ["testnet", "offline", ...findInArgv(["bool"])],
    string: ["_", ...findInArgv(["hex", "number", "empty"])],
});
findInArgv(["json_object", "json_array"]).forEach((key) => cliArgs[key] = JSON.parse(cliArgs[key])); // Parse JSON strings
const [endpoint, method] = cliArgs._ as string[];

if (cliArgs.help || cliArgs.h || !endpoint || !method) {
    printHelp();
} else {
    executeEndpointMethod(endpoint, method, cliArgs)
        .then((result) => console.log(JSON.stringify(result)))
        .catch((error) => console.error("Error:", error instanceof Error ? error.message : String(error)));
}
