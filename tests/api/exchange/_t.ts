// deno-lint-ignore-file no-import-prefix
import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { generatePrivateKey } from "npm:viem@2/accounts";
import { BigNumber } from "npm:bignumber.js@9";
import { ExchangeClient, HttpTransport, InfoClient, MultiSignClient } from "@nktkas/hyperliquid";
import { SymbolConverter } from "@nktkas/hyperliquid/utils";
import { getWalletAddress } from "../../../src/signing/mod.ts";

// —————————— Arguments ——————————

const cliArgs = parseArgs(Deno.args, { default: { wait: 0 }, string: ["_"] }) as Args<{ wait: number }>;
const PRIVATE_KEY = cliArgs._[0] as `0x${string}`;

// —————————— Preparation ——————————

const transport = new HttpTransport({ isTestnet: true, timeout: 30_000 });
const mainExchClient = new ExchangeClient({ wallet: PRIVATE_KEY, transport });
const infoClient = new InfoClient({ transport });

export const symbolConverter = await SymbolConverter.create({ transport });
export const allMids = await infoClient.allMids();

// —————————— Test ——————————

export function runTest(options: {
  name: string;
  codeTestFn: (
    t: Deno.TestContext,
    exchClient: ExchangeClient | MultiSignClient,
  ) => Promise<void>;
  cliTestFn?: (
    t: Deno.TestContext,
    runCommand: (args: string[]) => Promise<string>,
  ) => Promise<void>;
}): void {
  const { name, codeTestFn, cliTestFn } = options;

  if (!PRIVATE_KEY || !/^0x[a-fA-F0-9]{64}$/.test(PRIVATE_KEY)) {
    throw new Error("Please provide a valid private key (0x-prefixed 64 hex characters) as an argument");
  }

  Deno.test(name, async (t) => {
    await new Promise((r) => setTimeout(r, cliArgs.wait)); // delay to avoid rate limits

    for (const clientType of ["user", "multisig"] as const) {
      const exchClient = await createTempExchangeClient(clientType);
      await t.step(clientType, async (t) => await codeTestFn(t, exchClient))
        .finally(async () => {
          await cleanupTempExchangeClient(exchClient);
        });
    }

    await t.step({
      name: "cli",
      fn: async (t) => {
        await cliTestFn!(t, async (args: string[]) => {
          const command = new Deno.Command("deno", {
            args: ["run", "-A", "bin/cli.ts", "--offline", "--private-key", PRIVATE_KEY, ...args],
          });
          const { stdout, stderr } = await command.output();

          const error = new TextDecoder().decode(stderr);
          if (error !== "") throw new Error(`Command failed with error: ${error}`);

          const output = new TextDecoder().decode(stdout);
          if (output.startsWith("Hyperliquid CLI")) throw new Error(`Invalid command argument(s)`);

          return JSON.parse(output);
        });
      },
      ignore: cliTestFn === undefined,
    });
  });
}

// —————————— Helper functions ——————————

export async function createTempExchangeClient(type: "user" | "multisig"): Promise<ExchangeClient | MultiSignClient> {
  // Create temporary account
  const tempExchClient = new ExchangeClient({ wallet: generatePrivateKey(), transport });
  const tempAddress = await getWalletAddress(tempExchClient.wallet);

  // Activate account
  await mainExchClient.usdSend({ destination: tempAddress, amount: "2" });

  if (type === "user") {
    // Return as ExchangeClient
    return tempExchClient;
  } else {
    // Convert to MultiSigUser
    const mainAddress = await getWalletAddress(mainExchClient.wallet);
    await tempExchClient.convertToMultiSigUser({
      signers: {
        authorizedUsers: [mainAddress],
        threshold: 1,
      },
    });

    // Return as MultiSignClient
    return new MultiSignClient({
      multiSigUser: tempAddress,
      signers: [mainExchClient.wallet],
      transport,
    });
  }
}

export async function cleanupTempExchangeClient(client: ExchangeClient | MultiSignClient): Promise<void> {
  const mainUser = await getWalletAddress(mainExchClient.wallet);
  const tempUser = client instanceof MultiSignClient ? client.multiSigUser : await getWalletAddress(client.wallet);

  const webData2 = await infoClient.webData2({ user: tempUser });

  // Cancel all open orders
  const cancels = webData2.openOrders.map((o) => ({ a: symbolConverter.getAssetId(o.coin)!, o: o.oid }));
  if (cancels.length > 0) {
    await client.cancel({ cancels }).catch(() => undefined);
  }

  // Cancel all running TWAPs
  for (const [twapId, state] of webData2.twapStates) {
    const id = symbolConverter.getAssetId(state.coin)!;
    await client.twapCancel({ a: id, t: twapId }).catch(() => undefined);
  }

  // Close all positions
  await Promise.all(webData2.clearinghouseState.assetPositions.map(async (pos) => {
    const id = symbolConverter.getAssetId(pos.position.coin)!;
    const szDecimals = symbolConverter.getSzDecimals(pos.position.coin)!;
    const px = new BigNumber(pos.position.entryPx)
      .times(pos.position.positionValue.startsWith("-") ? 1.05 : 0.95)
      .toString();
    await client.order({
      orders: [{
        a: id,
        b: false,
        p: formatPrice(px, szDecimals),
        s: "0", // full position size
        r: true,
        t: { limit: { tif: "Gtc" } },
      }],
      grouping: "na",
    }).catch(() => undefined);
  }));

  // Withdraw all funds back to main account
  await infoClient.clearinghouseState({ user: tempUser })
    .then(async (state) => {
      await client.usdSend({ destination: mainUser, amount: state.withdrawable })
        .catch(() => undefined);
    });
  await infoClient.spotClearinghouseState({ user: tempUser })
    .then(async (state) => {
      const usdcBalance = parseFloat(state.balances.find((b) => b.coin === "USDC")?.total ?? "0");
      if (usdcBalance > 0) {
        await client.spotSend({
          destination: mainUser,
          token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
          amount: usdcBalance,
        }).catch(() => undefined);
      }
    });
}

export function formatPrice(
  price: BigNumber.Value,
  szDecimals: number,
  isPerp: boolean = true,
  roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_HALF_UP,
): string {
  const priceBN = new BigNumber(price);
  if (priceBN.isInteger()) return priceBN.toString();

  const maxDecimals = isPerp ? 6 : 8;
  const maxAllowedDecimals = Math.max(maxDecimals - szDecimals, 0);

  return priceBN
    .precision(5, roundingMode)
    .toFixed(maxAllowedDecimals, roundingMode);
}

export function formatSize(
  size: BigNumber.Value,
  szDecimals: number,
  roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_HALF_UP,
): string {
  return new BigNumber(size).toFixed(szDecimals, roundingMode);
}

export function randomCloid(): `0x${string}` {
  return `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
}

export function randomAddress(): `0x${string}` {
  return `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
}

export async function openOrder(
  client: ExchangeClient,
  type: "market" | "limit",
  symbol: string = "ETH",
  side: "buy" | "sell" = "buy",
  slippage: number = 0.05, // 5%
): Promise<{
  a: number;
  b: boolean;
  p: string;
  s: string;
  oid: number;
  cloid: `0x${string}`;
  pxUp: string;
  pxDown: string;
  midPx: string;
}> {
  // Top-up account
  await topUpPerp(client, "13");

  // Get market data
  const id = symbolConverter.getAssetId(symbol)!;
  const szDecimals = symbolConverter.getSzDecimals(symbol)!;
  const midPx = allMids[symbol];

  // Calculate order parameters
  const pxDown = formatPrice(new BigNumber(midPx).times(1 - slippage), szDecimals);
  const pxUp = formatPrice(new BigNumber(midPx).times(1 + slippage), szDecimals);
  const sz = formatSize(new BigNumber(11).div(midPx), szDecimals);

  let executionPx: string;
  if (type === "market") {
    executionPx = side === "buy" ? pxUp : pxDown;
  } else {
    executionPx = side === "buy" ? pxDown : pxUp;
  }

  // Place order
  const result = await client.order({
    orders: [{
      a: id,
      b: side === "buy",
      p: executionPx,
      s: sz,
      r: false,
      t: { limit: { tif: "Gtc" } },
      c: randomCloid(),
    }],
    grouping: "na",
  });

  // Extract order info
  const [order] = result.response.data.statuses;
  return {
    a: id,
    b: side === "buy",
    p: executionPx,
    s: sz,
    oid: "resting" in order ? order.resting.oid : order.filled.oid,
    cloid: "resting" in order ? order.resting.cloid! : order.filled.cloid!,
    pxUp,
    pxDown,
    midPx,
  };
}

export async function createTWAP(
  client: ExchangeClient,
  symbol: string = "ETH",
  side: "buy" | "sell" = "buy",
): Promise<{
  a: number;
  b: boolean;
  s: string;
  twapId: number;
  midPx: string;
}> {
  // Top-up account
  await topUpPerp(client, "60");

  // Get market data
  const id = symbolConverter.getAssetId(symbol)!;
  const szDecimals = symbolConverter.getSzDecimals(symbol)!;
  const midPx = allMids[symbol];

  // Calculate order parameters
  const sz = formatSize(new BigNumber(55).div(midPx), szDecimals);

  // Place TWAP order
  const result = await client.twapOrder({
    twap: {
      a: id,
      b: side === "buy",
      s: sz,
      r: false,
      m: 5,
      t: false,
    },
  });

  // Extract TWAP info
  const twapId = result.response.data.status.running.twapId;

  return {
    a: id,
    b: side === "buy",
    s: sz,
    twapId,
    midPx,
  };
}

export async function topUpPerp(client: ExchangeClient, amount: string) {
  const tempUser = client instanceof MultiSignClient ? client.multiSigUser : await getWalletAddress(client.wallet);
  await mainExchClient.usdSend({ destination: tempUser, amount });
}

export async function topUpSpot(client: ExchangeClient, token: "USDC" | "HYPE", amount: string) {
  const tokenAddresses = {
    USDC: "0xeb62eee3685fc4c43992febcd9e75443",
    HYPE: "0x7317beb7cceed72ef0b346074cc8e7ab",
  } as const;

  const tempUser = client instanceof MultiSignClient ? client.multiSigUser : await getWalletAddress(client.wallet);
  await mainExchClient.spotSend({
    destination: tempUser,
    token: `${token}:${tokenAddresses[token]}`,
    amount,
  });
}
