// deno-lint-ignore-file no-import-prefix
import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { type ExchangeClient, InfoClient, SubscriptionClient, WebSocketTransport } from "@nktkas/hyperliquid";
import { cleanupTempExchangeClient, createTempExchangeClient } from "../exchange/_t.ts";

// —————————— Arguments ——————————

const cliArgs = parseArgs(Deno.args, { default: { wait: 0 }, string: ["_"] }) as Args<{ wait: number }>;

// —————————— Functions ——————————

export function runTest(options: {
  name: string;
  mode: "api" | "rpc";
  fn: (t: Deno.TestContext, client: SubscriptionClient) => Promise<void>;
}): void {
  const { name, mode, fn } = options;

  Deno.test(name, async (t) => {
    await new Promise((r) => setTimeout(r, cliArgs.wait)); // delay to avoid rate limits

    // —————————— Preparation ——————————

    const transport = new WebSocketTransport({ url: `wss://${mode}.hyperliquid-testnet.xyz/ws`, isTestnet: true });
    await transport.ready();
    const subsClient = new SubscriptionClient({ transport });

    // —————————— Test ——————————

    await fn(t, subsClient)
      .finally(async () => {
        // —————————— Cleanup ——————————

        await transport.close();
      });
  });
}

export function runTestWithExchange(options: {
  name: string;
  fn: (
    t: Deno.TestContext,
    client: { subs: SubscriptionClient; exch: ExchangeClient; info: InfoClient },
  ) => Promise<void>;
}): void {
  const { name, fn } = options;

  Deno.test(name, async (t) => {
    await new Promise((r) => setTimeout(r, cliArgs.wait)); // delay to avoid rate limits

    // —————————— Preparation ——————————

    const transport = new WebSocketTransport({ isTestnet: true });
    await transport.ready();

    const exchClient = await createTempExchangeClient("user");
    const infoClient = new InfoClient({ transport });
    const subsClient = new SubscriptionClient({ transport });

    // —————————— Test ——————————

    await fn(t, { subs: subsClient, exch: exchClient, info: infoClient })
      .finally(async () => {
        // —————————— Cleanup ——————————

        await cleanupTempExchangeClient(exchClient);
        await transport.close();
      });
  });
}

// —————————— Utils ——————————

export { createTWAP, formatPrice, formatSize, openOrder, randomCloid } from "../exchange/_t.ts";
