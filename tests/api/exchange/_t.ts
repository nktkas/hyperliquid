// deno-lint-ignore-file no-import-prefix
import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { generatePrivateKey } from "npm:viem@2/accounts";
import { BigNumber } from "npm:bignumber.js@9";
import { ExchangeClient, HttpTransport, InfoClient, MultiSignClient } from "@nktkas/hyperliquid";
import { getWalletAddress } from "../../../src/signing/mod.ts";

const cliArgs = parseArgs(Deno.args, { default: { wait: 0 }, string: ["_"] }) as Args<{ wait: number }>;
const PRIVATE_KEY = cliArgs._[0] as `0x${string}`;
if (!PRIVATE_KEY || !/^0x[a-fA-F0-9]{64}$/.test(PRIVATE_KEY)) {
  throw new Error("Please provide a valid private key (0x-prefixed 64 hex characters) as an argument");
}

// —————————— Clients ——————————

async function createExchangeClient(mainExchClient: ExchangeClient): Promise<ExchangeClient> {
  const tempExchClient = new ExchangeClient({ wallet: generatePrivateKey(), transport });
  await mainExchClient.usdSend({
    destination: await getWalletAddress(tempExchClient.wallet),
    amount: "2",
  });
  return tempExchClient;
}
async function createMultiSignClient(mainExchClient: ExchangeClient): Promise<MultiSignClient> {
  const tempExchClient = new ExchangeClient({ wallet: generatePrivateKey(), transport });
  await mainExchClient.usdSend({
    destination: await getWalletAddress(tempExchClient.wallet),
    amount: "2",
  });
  await tempExchClient.convertToMultiSigUser({
    signers: {
      authorizedUsers: [await getWalletAddress(mainExchClient.wallet)],
      threshold: 1,
    },
  });
  return new MultiSignClient({
    multiSigUser: await getWalletAddress(tempExchClient.wallet),
    signers: [mainExchClient.wallet],
    transport,
  });
}

const transport = new HttpTransport({ isTestnet: true, timeout: 30_000 });
const mainExchClient = new ExchangeClient({ wallet: PRIVATE_KEY, transport });
const infoClient = new InfoClient({ transport });
const exchClient = await createExchangeClient(mainExchClient);
const multiSignClient = await createMultiSignClient(mainExchClient);

// —————————— Functions ——————————

export function runTest(options: {
  name: string;
  topup?: { perp?: string; spot?: string; evm?: string; staking?: string };
  codeTestFn: (
    t: Deno.TestContext,
    clients: {
      info: InfoClient;
      exchange: ExchangeClient | MultiSignClient;
    },
  ) => Promise<void>;
  cliTestFn?: (
    t: Deno.TestContext,
    runCommand: (args: string[]) => Promise<string>,
  ) => Promise<void>;
}): void {
  const { name, topup, codeTestFn, cliTestFn } = options;

  Deno.test(name, async (t) => {
    await new Promise((r) => setTimeout(r, cliArgs.wait)); // delay to avoid rate limits

    if (topup) {
      if (topup.perp) {
        await mainExchClient.usdSend({
          destination: await getWalletAddress(exchClient.wallet),
          amount: topup.perp,
        });
        await mainExchClient.usdSend({
          destination: multiSignClient.multiSigUser,
          amount: topup.perp,
        });
      }
      if (topup.spot) {
        await mainExchClient.spotSend({
          destination: await getWalletAddress(exchClient.wallet),
          token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
          amount: topup.spot,
        });
        await mainExchClient.spotSend({
          destination: multiSignClient.multiSigUser,
          token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
          amount: topup.spot,
        });
      }
      if (topup.evm) {
        await mainExchClient.spotSend({
          destination: await getWalletAddress(exchClient.wallet),
          token: "HYPE:0x7317beb7cceed72ef0b346074cc8e7ab",
          amount: topup.evm,
        });
        await mainExchClient.spotSend({
          destination: multiSignClient.multiSigUser,
          token: "HYPE:0x7317beb7cceed72ef0b346074cc8e7ab",
          amount: topup.evm,
        });
      }
      if (topup.staking) {
        await mainExchClient.spotSend({
          destination: await getWalletAddress(exchClient.wallet),
          token: "HYPE:0x7317beb7cceed72ef0b346074cc8e7ab",
          amount: topup.staking,
        });
        await exchClient.cDeposit({ wei: Math.trunc(parseFloat(topup.staking) * 1e8) });

        await mainExchClient.spotSend({
          destination: multiSignClient.multiSigUser,
          token: "HYPE:0x7317beb7cceed72ef0b346074cc8e7ab",
          amount: topup.staking,
        });
        await multiSignClient.cDeposit({ wei: Math.trunc(parseFloat(topup.staking) * 1e8) });
      }
    }

    try {
      for (const exchangeClient of [exchClient, multiSignClient] as const) {
        await t.step(
          exchangeClient instanceof MultiSignClient ? "MultiSignClient" : "ExchangeClient",
          async (t) => await codeTestFn(t, { info: infoClient, exchange: exchangeClient }),
        );
      }
    } finally {
      await Promise.all([
        infoClient.clearinghouseState({ user: await getWalletAddress(exchClient.wallet) })
          .then(async (state) => {
            await exchClient.usdSend({
              destination: await getWalletAddress(mainExchClient.wallet),
              amount: state.withdrawable,
            }).catch(() => undefined);
          }),
        infoClient.clearinghouseState({ user: multiSignClient.multiSigUser })
          .then(async (state) => {
            await multiSignClient.usdSend({
              destination: await getWalletAddress(mainExchClient.wallet),
              amount: state.withdrawable,
            }).catch(() => undefined);
          }),
      ]);
    }

    await t.step({
      name: "CLI",
      fn: async (t) => {
        await cliTestFn!(t, async (args: string[]) => {
          const command = new Deno.Command("deno", {
            args: ["run", "-A", "bin/cli.ts", "--offline", "--private-key", PRIVATE_KEY, ...args],
            stdout: "piped",
            stderr: "piped",
          });
          const { stdout, stderr } = await command.output();
          const error = new TextDecoder().decode(stderr);
          if (error !== "") {
            throw new Error(`Command failed with error: ${error}`);
          }
          const output = new TextDecoder().decode(stdout);
          if (output.startsWith("Hyperliquid CLI")) {
            throw new Error(`Invalid command argument(s)`);
          }
          return output;
        });
      },
      ignore: cliTestFn === undefined,
    });
  });
}

// —————————— Utils ——————————

export function randomCloid(): `0x${string}` {
  return `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
}

export async function getAssetData(assetName: string) {
  const data = await infoClient.metaAndAssetCtxs();
  const id = data[0].universe.findIndex((u) => u.name === assetName);
  if (id === -1) throw new Error(`Asset "${assetName}" not found`);
  const universe = data[0].universe[id];
  const ctx = data[1][id];
  return { id, universe, ctx };
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

export function anyFnSuccess<T>(functions: (() => T)[]): T {
  const errors: Error[] = [];
  for (const fn of functions) {
    try {
      return fn();
    } catch (error) {
      errors.push(error instanceof Error ? error : new Error(String(error)));
    }
  }
  throw new AggregateError(errors, "All functions failed");
}
