import {
  type ExchangeClient,
  type ExchangeMultiSigConfig,
  type ExchangeSingleWalletConfig,
  InfoClient,
  SubscriptionClient,
  WebSocketTransport,
} from "@nktkas/hyperliquid";
import { cleanupTempExchangeClient, createTempExchangeClient } from "../exchange/_t.ts";

// =============================================================
// Arguments
// =============================================================

const WAIT = 5000;

// =============================================================
// Test
// =============================================================

export function runTest(options: {
  name: string;
  mode: "api" | "rpc";
  fn: (t: Deno.TestContext, client: SubscriptionClient) => Promise<void>;
}): void {
  const { name, mode, fn } = options;

  Deno.test(name, async (t) => {
    await new Promise((r) => setTimeout(r, WAIT)); // delay to avoid rate limits

    // --- Preparation ------------------------------------------------

    const transport = new WebSocketTransport({ url: `wss://${mode}.hyperliquid-testnet.xyz/ws`, isTestnet: true });
    await transport.ready();
    const subsClient = new SubscriptionClient({ transport });

    // --- Test ------------------------------------------------

    await fn(t, subsClient)
      .finally(async () => {
        // --- Cleanup ------------------------------------------------

        await transport.close();
      });
  });
}

export function runTestWithExchange(options: {
  name: string;
  fn: (
    t: Deno.TestContext,
    client: {
      subs: SubscriptionClient;
      exch: ExchangeClient<ExchangeSingleWalletConfig | ExchangeMultiSigConfig>;
      info: InfoClient;
    },
  ) => Promise<void>;
}): void {
  const { name, fn } = options;

  Deno.test(name, async (t) => {
    await new Promise((r) => setTimeout(r, WAIT)); // delay to avoid rate limits

    // --- Preparation ------------------------------------------------

    const transport = new WebSocketTransport({ isTestnet: true });
    await transport.ready();

    const exchClient = await createTempExchangeClient("user");
    const infoClient = new InfoClient({ transport });
    const subsClient = new SubscriptionClient({ transport });

    // --- Test ------------------------------------------------

    await fn(t, { subs: subsClient, exch: exchClient, info: infoClient })
      .finally(async () => {
        // --- Cleanup ------------------------------------------------

        await cleanupTempExchangeClient(exchClient);
        await transport.close();
      });
  });
}

// =============================================================
// Helpers
// =============================================================

export { createTWAP, openOrder } from "../exchange/_t.ts";

export function collectEventsOverTime<T>(
  fn: (cb: (event: T) => void) => unknown,
  durationMs: number,
): Promise<T[]> {
  return new Promise((resolve) => {
    const data: T[] = [];
    fn((event) => data.push(event));
    setTimeout(() => resolve(data), durationMs);
  });
}
