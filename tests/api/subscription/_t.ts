// deno-lint-ignore-file no-import-prefix
import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { BigNumber } from "npm:bignumber.js@9";
import { generatePrivateKey } from "npm:viem@2/accounts";
import { ExchangeClient, HttpTransport, InfoClient, SubscriptionClient, WebSocketTransport } from "@nktkas/hyperliquid";
import { getWalletAddress } from "../../../src/signing/mod.ts";

// —————————— Arguments ——————————

const cliArgs = parseArgs(Deno.args, { default: { wait: 1000 }, string: ["_"] }) as Args<{ wait: number }>;
const PRIVATE_KEY = cliArgs._[0] as `0x${string}`;

// —————————— Clients ——————————

async function createExchangeClient(mainExchClient: ExchangeClient): Promise<ExchangeClient> {
  const tempExchClient = new ExchangeClient({
    wallet: generatePrivateKey(),
    transport: new HttpTransport({ isTestnet: true }),
  });
  await mainExchClient.usdSend({
    destination: await getWalletAddress(tempExchClient.wallet),
    amount: "2",
  });
  return tempExchClient;
}

// —————————— Functions ——————————

export function runTest(
  name: string,
  mode: "api" | "rpc",
  fn: (t: Deno.TestContext, client: SubscriptionClient) => Promise<void>,
): void {
  Deno.test(name, async (t) => {
    await new Promise((r) => setTimeout(r, cliArgs.wait)); // delay to avoid rate limits

    const transport = new WebSocketTransport({ url: `wss://${mode}.hyperliquid-testnet.xyz/ws`, isTestnet: true });
    await transport.ready();
    const subsClient = new SubscriptionClient({ transport });

    await fn(t, subsClient);

    await transport.close();
  });
}

export function runTestWithExchange(
  name: string,
  fn: (
    t: Deno.TestContext,
    client: { subs: SubscriptionClient; exchange: ExchangeClient; info: InfoClient },
  ) => Promise<void>,
): void {
  if (!PRIVATE_KEY || !/^0x[a-fA-F0-9]{64}$/.test(PRIVATE_KEY)) {
    throw new Error("Please provide a valid private key (0x-prefixed 64 hex characters) as an argument");
  }

  Deno.test(name, async (t) => {
    await new Promise((r) => setTimeout(r, cliArgs.wait)); // delay to avoid rate limits

    const transport = new WebSocketTransport({ isTestnet: true });
    await transport.ready();

    const subsClient = new SubscriptionClient({ transport });

    const mainExchClient = new ExchangeClient({ wallet: PRIVATE_KEY, transport });
    const exchClient = await createExchangeClient(mainExchClient);

    const infoClient = new InfoClient({ transport });

    try {
      await fn(t, { subs: subsClient, exchange: exchClient, info: infoClient });
    } finally {
      const state = await infoClient.clearinghouseState({ user: await getWalletAddress(exchClient.wallet) });
      await exchClient.usdSend({
        destination: await getWalletAddress(mainExchClient.wallet),
        amount: state.withdrawable,
      }).catch(() => undefined);

      await transport.close();
    }
  });
}

// —————————— Utils ——————————

export function randomCloid(): `0x${string}` {
  return `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
}

export async function getAssetData(assetName: string) {
  const infoClient = new InfoClient({ transport: new HttpTransport({ isTestnet: true }) });
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
