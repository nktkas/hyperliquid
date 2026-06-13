import { ExplorerClient, HttpTransport, WebSocketTransport } from "@nktkas/hyperliquid";

// =============================================================
// Arguments
// =============================================================

const WAIT = 5000;
const OFFLINE = Deno.args.includes("--offline");

// =============================================================
// Test
// =============================================================

/**
 * Runs an explorer HTTP-request test on an `HttpTransport` (testnet RPC URL).
 */
export function runRequestTest(options: {
  name: string;
  fn: (t: Deno.TestContext, client: ExplorerClient<HttpTransport>) => Promise<void>;
}): void {
  const { name, fn } = options;

  Deno.test(name, { ignore: OFFLINE }, async (t) => {
    await new Promise((r) => setTimeout(r, WAIT)); // delay to avoid rate limits

    // --- Preparation ------------------------------------------------

    const transport = new HttpTransport({ isTestnet: true });
    const client = new ExplorerClient({ transport });

    // --- Test ------------------------------------------------

    await fn(t, client);
  });
}

/**
 * Runs an explorer WebSocket-subscription test on a `WebSocketTransport` (testnet RPC URL).
 */
export function runSubscriptionTest(options: {
  name: string;
  fn: (t: Deno.TestContext, client: ExplorerClient<WebSocketTransport>) => Promise<void>;
}): void {
  const { name, fn } = options;

  Deno.test(name, { ignore: OFFLINE }, async (t) => {
    await new Promise((r) => setTimeout(r, WAIT)); // delay to avoid rate limits

    // --- Preparation ------------------------------------------------

    const transport = new WebSocketTransport({ url: "wss://rpc.hyperliquid-testnet.xyz/ws", isTestnet: true });
    await transport.ready();
    const client = new ExplorerClient({ transport });

    // --- Test ------------------------------------------------

    await fn(t, client)
      .finally(async () => {
        // --- Cleanup ------------------------------------------------

        await transport.close();
      });
  });
}

// =============================================================
// Helpers
// =============================================================

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
