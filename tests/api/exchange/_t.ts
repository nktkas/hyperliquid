// deno-lint-ignore-file no-import-prefix
import "jsr:@std/dotenv@^0.225.5/load";
import type * as v from "@valibot/valibot";
import { generatePrivateKey, privateKeyToAccount } from "npm:viem@2/accounts";
import {
  ExchangeClient,
  type ExchangeMultiSigConfig,
  type ExchangeSingleWalletConfig,
  HttpTransport,
  InfoClient,
} from "@nktkas/hyperliquid";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { formatPrice, formatSize, SymbolConverter } from "@nktkas/hyperliquid/utils";
import type { ExcludeErrorResponse } from "../../../src/api/exchange/_methods/_base/errors.ts";

// =============================================================
// Arguments
// =============================================================

const WAIT = 5000;

const PRIVATE_KEY = Deno.env.get("PRIVATE_KEY") as `0x${string}` | undefined;
const MAIN_WALLET = PRIVATE_KEY ? privateKeyToAccount(PRIVATE_KEY) : undefined;

// =============================================================
// Preparation
// =============================================================

const transport = new HttpTransport({ isTestnet: true, timeout: 30_000 });
const infoClient = new InfoClient({ transport });

export const symbolConverter = await SymbolConverter.create({ transport });
export const allMids = await infoClient.allMids();

// =============================================================
// Test
// =============================================================

/**
 * Help function to run SDK CLI commands
 * @throws {Error} When CLI returns an error message
 */
async function runCLICommand(args: string[]): Promise<string> {
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
}

export function runTest(options: {
  name: string;
  codeTestFn: (
    t: Deno.TestContext,
    exchClient: ExchangeClient<ExchangeSingleWalletConfig | ExchangeMultiSigConfig>,
  ) => Promise<void>;
  cliTestFn?: (t: Deno.TestContext, runCommand: (args: string[]) => string | Promise<string>) => Promise<void>;
}): void {
  const { name, codeTestFn, cliTestFn } = options;

  Deno.test(name, { ignore: !MAIN_WALLET }, async (t) => {
    await new Promise((r) => setTimeout(r, WAIT)); // delay to avoid rate limits

    // Test related to client interaction
    await t.step("code", async (t) => {
      for (const clientType of ["user", "multisig"] as const) {
        const exchClient = await createTempExchangeClient(clientType);
        await t.step(clientType, async (t) => await codeTestFn(t, exchClient))
          .finally(async () => {
            await cleanupTempExchangeClient(exchClient);
          });
      }
    });

    // Test related to CLI interaction
    await t.step({
      name: "cli",
      ignore: !cliTestFn,
      fn: async () => {
        await cliTestFn!(t, runCLICommand);
      },
    });
  });
}

// =============================================================
// Helpers
// =============================================================

export async function createTempExchangeClient(
  type: "user" | "multisig",
): Promise<ExchangeClient<ExchangeSingleWalletConfig | ExchangeMultiSigConfig>> {
  const mainExchClient = new ExchangeClient({ wallet: MAIN_WALLET!, transport });

  // Create temporary account
  const tempWallet = privateKeyToAccount(generatePrivateKey());
  const tempExchClient = new ExchangeClient({ wallet: tempWallet, transport });

  // Activate account
  await mainExchClient.usdSend({ destination: tempWallet.address, amount: "2" });

  if (type === "user") {
    // Return as single-wallet ExchangeClient
    return tempExchClient;
  } else {
    // Convert to MultiSigUser
    await tempExchClient.convertToMultiSigUser({
      signers: {
        authorizedUsers: [MAIN_WALLET!.address],
        threshold: 1,
      },
    });

    // Return as multi-sig ExchangeClient
    return new ExchangeClient({
      multiSigUser: tempWallet.address,
      signers: [MAIN_WALLET!],
      transport,
    });
  }
}

export async function cleanupTempExchangeClient(
  tempClient: ExchangeClient<ExchangeSingleWalletConfig | ExchangeMultiSigConfig>,
): Promise<void> {
  const tempUser = "multiSigUser" in tempClient.config_
    ? tempClient.config_.multiSigUser
    : await getWalletAddress(tempClient.config_.wallet);

  const webData2 = await infoClient.webData2({ user: tempUser });

  // Cancel all open orders
  const cancels = webData2.openOrders.map((o) => ({ a: symbolConverter.getAssetId(o.coin)!, o: o.oid }));
  if (cancels.length > 0) {
    await tempClient.cancel({ cancels }).catch(() => undefined);
  }

  // Cancel all running TWAPs
  for (const [twapId, state] of webData2.twapStates) {
    const id = symbolConverter.getAssetId(state.coin)!;
    await tempClient.twapCancel({ a: id, t: twapId }).catch(() => undefined);
  }

  // Close all positions
  await Promise.all(webData2.clearinghouseState.assetPositions.map(async (pos) => {
    const id = symbolConverter.getAssetId(pos.position.coin)!;
    const szDecimals = symbolConverter.getSzDecimals(pos.position.coin)!;
    const px = Number(pos.position.entryPx) * (pos.position.positionValue.startsWith("-") ? 1.05 : 0.95);
    await tempClient.order({
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
      await tempClient.usdSend({ destination: MAIN_WALLET!.address, amount: state.withdrawable })
        .catch(() => undefined);
    });
  await infoClient.spotClearinghouseState({ user: tempUser })
    .then(async (state) => {
      const usdcBalance = Number(state.balances.find((b) => b.coin === "USDC")?.total ?? "0");
      if (usdcBalance > 0) {
        await tempClient.spotSend({
          destination: MAIN_WALLET!.address,
          token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
          amount: usdcBalance,
        }).catch(() => undefined);
      }
    });
}

export async function openOrder(
  client: ExchangeClient<ExchangeSingleWalletConfig | ExchangeMultiSigConfig>,
  type: "market" | "limit",
  symbol = "ETH",
  side: "buy" | "sell" = "buy",
  slippage = 0.05, // 5%
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
      c: "0x17a5a40306205a0c6d60c7264153781c",
    }],
    grouping: "na",
  });

  // Extract order info
  const [order] = result.response.data.statuses as (
    | { resting: { oid: number; cloid: `0x${string}` } }[]
    | { filled: { oid: number; cloid: `0x${string}` } }[]
  );
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
  client: ExchangeClient<ExchangeSingleWalletConfig | ExchangeMultiSigConfig>,
  symbol = "ETH",
  side: "buy" | "sell" = "buy",
): Promise<{ a: number; b: boolean; s: string; twapId: number; midPx: string }> {
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

export async function topUpPerp(
  client: ExchangeClient<ExchangeSingleWalletConfig | ExchangeMultiSigConfig>,
  amount: string,
): Promise<void> {
  const mainExchClient = new ExchangeClient({ wallet: MAIN_WALLET!, transport });
  const tempUser = "multiSigUser" in client.config_
    ? client.config_.multiSigUser
    : await getWalletAddress(client.config_.wallet);
  await mainExchClient.usdSend({ destination: tempUser, amount });
}

export async function topUpSpot(
  client: ExchangeClient<ExchangeSingleWalletConfig | ExchangeMultiSigConfig>,
  token: "USDC" | "HYPE",
  amount: string,
): Promise<void> {
  const tokenAddresses = {
    USDC: "0xeb62eee3685fc4c43992febcd9e75443",
    HYPE: "0x7317beb7cceed72ef0b346074cc8e7ab",
  } as const;

  const mainExchClient = new ExchangeClient({ wallet: MAIN_WALLET!, transport });
  const tempUser = "multiSigUser" in client.config_
    ? client.config_.multiSigUser
    : await getWalletAddress(client.config_.wallet);
  await mainExchClient.spotSend({
    destination: tempUser,
    token: `${token}:${tokenAddresses[token]}`,
    amount,
  });
}

// =============================================================
// Schema Modifier
// =============================================================

type InferOutputWithoutErrors<T> = T extends v.GenericSchema<unknown, infer O> ? ExcludeErrorResponse<O> : never;

export function excludeErrorResponse<T extends v.GenericSchema>(
  schema: T,
): v.GenericSchema<v.InferInput<T>, InferOutputWithoutErrors<T>> {
  // Deep clone schema preserving functions and getters
  function cloneSchema(s: v.GenericSchema): v.GenericSchema {
    const clone = Object.defineProperties({}, Object.getOwnPropertyDescriptors(s)) as v.GenericSchema;

    if ("pipe" in clone && Array.isArray(clone.pipe)) {
      (clone as Record<string, unknown>).pipe = clone.pipe.map((p) =>
        typeof p === "object" && p !== null ? cloneSchema(p as v.GenericSchema) : p
      );
    }
    if ("options" in clone && Array.isArray(clone.options)) {
      (clone as Record<string, unknown>).options = clone.options.map(cloneSchema);
    }
    if ("entries" in clone && typeof clone.entries === "object" && clone.entries !== null) {
      (clone as Record<string, unknown>).entries = Object.fromEntries(
        Object.entries(clone.entries).map(([k, v]) => [k, cloneSchema(v as v.GenericSchema)]),
      );
    }
    if ("item" in clone && typeof clone.item === "object" && clone.item !== null) {
      (clone as Record<string, unknown>).item = cloneSchema(clone.item as v.GenericSchema);
    }
    if ("wrapped" in clone && typeof clone.wrapped === "object" && clone.wrapped !== null) {
      (clone as Record<string, unknown>).wrapped = cloneSchema(clone.wrapped as v.GenericSchema);
    }
    return clone;
  }

  // Work on a cloned copy to avoid mutating the original
  const cloned = cloneSchema(schema);

  // Unwrap pipe wrapper to get the underlying schema
  function getBase(s: v.GenericSchema): v.GenericSchema {
    return "pipe" in s && Array.isArray(s.pipe) ? s.pipe[0] : s;
  }

  function getEntries(s: v.GenericSchema): Record<string, v.GenericSchema> | null {
    const base = getBase(s);
    return "entries" in base && typeof base.entries === "object"
      ? base.entries as Record<string, v.GenericSchema>
      : null;
  }

  function getArrayItem(s: v.GenericSchema): v.GenericSchema | null {
    const base = getBase(s);
    return "item" in base && typeof base.item === "object" ? base.item as v.GenericSchema : null;
  }

  function getUnionOptions(s: v.GenericSchema): v.GenericSchema[] | null {
    const base = getBase(s);
    return "type" in base && base.type === "union" && "options" in base && Array.isArray(base.options)
      ? base.options
      : null;
  }

  function setUnionOptions(s: v.GenericSchema, options: v.GenericSchema[]): void {
    const base = getBase(s);
    if ("options" in s) (s as { options: v.GenericSchema[] }).options = options;
    if (base !== s && "options" in base) (base as { options: v.GenericSchema[] }).options = options;
  }

  function hasErrStatus(s: v.GenericSchema): boolean {
    const entries = getEntries(s);
    if (!entries || !("status" in entries)) return false;
    const statusBase = getBase(entries.status);
    return "type" in statusBase && statusBase.type === "literal" && "literal" in statusBase &&
      statusBase.literal === "err";
  }

  function hasErrorField(s: v.GenericSchema): boolean {
    const entries = getEntries(s);
    return entries !== null && "error" in entries;
  }

  function filterUnion(s: v.GenericSchema, predicate: (opt: v.GenericSchema) => boolean): void {
    const options = getUnionOptions(s);
    if (!options) return;
    const filtered = options.filter(predicate);
    if (filtered.length > 0 && filtered.length < options.length) {
      setUnionOptions(s, filtered);
    }
  }

  // Remove top-level ErrorResponse (status: "err") from union
  if (getUnionOptions(cloned)) {
    filterUnion(cloned, (opt) => !hasErrStatus(opt));
  }

  // Remove nested error responses from response.data.statuses[] or response.data.status
  function processNestedErrors(target: v.GenericSchema): void {
    const topEntries = getEntries(target);
    if (!topEntries?.response) return;

    const responseEntries = getEntries(topEntries.response);
    if (!responseEntries?.data) return;

    const dataEntries = getEntries(responseEntries.data);
    if (!dataEntries) return;

    if ("statuses" in dataEntries) {
      const item = getArrayItem(dataEntries.statuses);
      if (item) filterUnion(item, (opt) => !hasErrorField(opt));
    }

    if ("status" in dataEntries) {
      filterUnion(dataEntries.status, (opt) => !hasErrorField(opt));
    }
  }

  const options = getUnionOptions(cloned);
  if (options) {
    options.forEach(processNestedErrors);
  } else {
    processNestedErrors(cloned);
  }

  return cloned as v.GenericSchema<v.InferInput<T>, InferOutputWithoutErrors<T>>;
}
