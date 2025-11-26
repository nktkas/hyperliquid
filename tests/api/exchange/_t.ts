// deno-lint-ignore-file no-import-prefix
import "jsr:@std/dotenv@^0.225.5/load";
import type * as v from "@valibot/valibot";
import { ExchangeClient, HttpTransport, InfoClient, MultiSignClient } from "../../../src/mod.ts";
import { getWalletAddress } from "../../../src/signing/mod.ts";
import { formatPrice, formatSize, SymbolConverter } from "../../../src/utils/mod.ts";
import type { ExcludeErrorResponse } from "../../../src/api/exchange/_base/_types.ts";

// —————————— Arguments ——————————

const WAIT = 5000;
const PRIVATE_KEY = Deno.env.get("PRIVATE_KEY") as `0x${string}` | undefined;

// —————————— Preparation ——————————

const transport = new HttpTransport({ isTestnet: true, timeout: 30_000 });
const infoClient = new InfoClient({ transport });

export const symbolConverter = await SymbolConverter.create({ transport });
export const allMids = await infoClient.allMids();

// —————————— Test ——————————

export function runTest(options: {
  name: string;
  codeTestFn: (t: Deno.TestContext, exchClient: ExchangeClient | MultiSignClient) => Promise<void>;
  cliTestFn?: (t: Deno.TestContext, runCommand: (args: string[]) => string | Promise<string>) => Promise<void>;
}): void {
  const { name, codeTestFn, cliTestFn } = options;

  Deno.test(name, { ignore: !PRIVATE_KEY }, async (t) => {
    await new Promise((r) => setTimeout(r, WAIT)); // delay to avoid rate limits

    await t.step("code", async (t) => {
      for (const clientType of ["user", "multisig"] as const) {
        const exchClient = await createTempExchangeClient(clientType);
        await t.step(clientType, async (t) => await codeTestFn(t, exchClient))
          .finally(async () => {
            await cleanupTempExchangeClient(exchClient);
          });
      }
    });

    await t.step({
      name: "cli",
      ignore: !cliTestFn,
      fn: async () => {
        await cliTestFn!(t, async (args) => {
          const command = new Deno.Command("deno", {
            args: ["run", "-A", "bin/cli.ts", "--offline", "--private-key", PRIVATE_KEY!, ...args],
            stdout: "piped",
            stderr: "piped",
          });
          const { stdout } = await command.output();
          const output = new TextDecoder().decode(stdout);

          if (output.startsWith("Hyperliquid CLI")) {
            throw new Error(`Invalid command argument(s)`);
          }

          return JSON.parse(output);
        });
      },
    });
  });
}

// —————————— Helper functions ——————————

export async function createTempExchangeClient(type: "user" | "multisig"): Promise<ExchangeClient | MultiSignClient> {
  const mainExchClient = new ExchangeClient({ wallet: PRIVATE_KEY!, transport });

  // Create temporary account
  const tempExchClient = new ExchangeClient({ wallet: randomPrivateKey(), transport });
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
  const mainExchClient = new ExchangeClient({ wallet: PRIVATE_KEY!, transport });
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
    const px = Number(pos.position.entryPx) * (pos.position.positionValue.startsWith("-") ? 1.05 : 0.95);
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
      const usdcBalance = Number(state.balances.find((b) => b.coin === "USDC")?.total ?? "0");
      if (usdcBalance > 0) {
        await client.spotSend({
          destination: mainUser,
          token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
          amount: usdcBalance,
        }).catch(() => undefined);
      }
    });
}

export function randomCloid(): `0x${string}` {
  return `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
}

export function randomAddress(): `0x${string}` {
  return `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
}

function randomPrivateKey(): `0x${string}` {
  const key = new Uint8Array(32);
  crypto.getRandomValues(key);
  return `0x${Array.from(key).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
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
  const pxDown = formatPrice(Number(midPx) * (1 - slippage), szDecimals);
  const pxUp = formatPrice(Number(midPx) * (1 + slippage), szDecimals);
  const sz = formatSize(11 / Number(midPx), szDecimals);

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
  const sz = formatSize(55 / Number(midPx), szDecimals);

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
  const mainExchClient = new ExchangeClient({ wallet: PRIVATE_KEY!, transport });
  const tempUser = client instanceof MultiSignClient ? client.multiSigUser : await getWalletAddress(client.wallet);
  await mainExchClient.usdSend({ destination: tempUser, amount });
}

export async function topUpSpot(client: ExchangeClient, token: "USDC" | "HYPE", amount: string) {
  const tokenAddresses = {
    USDC: "0xeb62eee3685fc4c43992febcd9e75443",
    HYPE: "0x7317beb7cceed72ef0b346074cc8e7ab",
  } as const;

  const mainExchClient = new ExchangeClient({ wallet: PRIVATE_KEY!, transport });
  const tempUser = client instanceof MultiSignClient ? client.multiSigUser : await getWalletAddress(client.wallet);
  await mainExchClient.spotSend({
    destination: tempUser,
    token: `${token}:${tokenAddresses[token]}`,
    amount,
  });
}

type InferOutputWithoutErrors<T> = T extends v.GenericSchema<unknown, infer O> ? ExcludeErrorResponse<O> : never;

export function excludeErrorResponse<T extends v.GenericSchema>(
  schema: T,
): v.GenericSchema<v.InferInput<T>, InferOutputWithoutErrors<T>> {
  const getPipeEntries = (s: v.GenericSchema): Record<string, v.GenericSchema> | null => {
    if ("pipe" in s && Array.isArray(s.pipe) && "entries" in s.pipe[0] && typeof s.pipe[0].entries === "object") {
      return s.pipe[0].entries;
    }
    return null;
  };

  const getPipeBase = (s: v.GenericSchema): v.GenericSchema | null => {
    if ("pipe" in s && Array.isArray(s.pipe)) {
      return s.pipe[0];
    }
    return null;
  };

  const removeErrorFromUnion = (unionSchema: v.GenericSchema): void => {
    if (
      "type" in unionSchema && unionSchema.type === "union" && "options" in unionSchema &&
      Array.isArray(unionSchema.options)
    ) {
      const filtered = unionSchema.options.filter((opt) =>
        !("entries" in opt && typeof opt.entries === "object" && "error" in opt.entries)
      );
      if (filtered.length > 0) {
        unionSchema.options = filtered;
      }
    }
  };

  const s = schema;

  // Case 1: Remove ErrorResponse from top-level union[SuccessResponse, ErrorResponse]
  const topBase = getPipeBase(s);
  if (
    topBase && "type" in topBase && topBase.type === "union" && "options" in topBase && Array.isArray(topBase.options)
  ) {
    const filtered = topBase.options.filter((opt) => {
      const optEntries = getPipeEntries(opt);
      if (optEntries && "status" in optEntries) {
        const statusSchema = optEntries.status;
        const statusBase = getPipeBase(statusSchema);
        if (statusBase && statusBase.type === "literal" && "literal" in statusBase && statusBase.literal === "err") {
          return false; // Remove ErrorResponse
        }
      }
      return true;
    });
    if (filtered.length > 0 && filtered.length < topBase.options.length) {
      topBase.options = filtered;
      return schema as v.GenericSchema<v.InferInput<T>, InferOutputWithoutErrors<T>>;
    }
  }

  // Case 2 & 3: Remove error from response.data.statuses or response.data.status
  const topEntries = getPipeEntries(s);
  if (topEntries && "response" in topEntries) {
    const responseEntries = getPipeEntries(topEntries.response);
    if (responseEntries && "data" in responseEntries) {
      const dataEntries = getPipeEntries(responseEntries.data);
      if (dataEntries) {
        // Case 2: Remove error from statuses array union
        if ("statuses" in dataEntries) {
          const statusesSchema = dataEntries.statuses;
          const statusesBase = getPipeBase(statusesSchema);
          if (statusesBase && "item" in statusesBase && typeof statusesBase.item === "object") {
            removeErrorFromUnion(statusesBase.item as v.GenericSchema);
          }
        }

        // Case 3: Remove error from single status union
        if ("status" in dataEntries) {
          const statusSchema = dataEntries.status;
          const statusBase = getPipeBase(statusSchema);
          if (statusBase) {
            removeErrorFromUnion(statusBase);
          }
        }
      }
    }
  }

  return schema as v.GenericSchema<v.InferInput<T>, InferOutputWithoutErrors<T>>;
}
