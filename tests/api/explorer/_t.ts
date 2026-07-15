/**
 * Shared helpers for live Explorer API tests.
 * @module
 */

import { ExplorerClient, HttpTransport, WebSocketTransport } from "@nktkas/hyperliquid";

// =============================================================================
// Arguments
// =============================================================================

const WAIT = 5000;
const OFFLINE = Deno.args.includes("--offline");

// =============================================================================
// Test
// =============================================================================

/**
 * Runs an explorer HTTP-request test on an `HttpTransport` (testnet RPC URL by default).
 */
export function runRequestTest(options: {
  name: string;
  /** Uses the testnet RPC when true; defaults to `true`. */
  isTestnet?: boolean;
  fn: (t: Deno.TestContext, client: ExplorerClient<HttpTransport>) => Promise<void>;
}): void {
  const { name, isTestnet = true, fn } = options;

  Deno.test(name, { ignore: OFFLINE }, async (t) => {
    await new Promise((r) => setTimeout(r, WAIT)); // delay to avoid rate limits

    const transport = new HttpTransport({ isTestnet });
    const client = new ExplorerClient({ transport });

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

    const transport = new WebSocketTransport({ url: "wss://rpc.hyperliquid-testnet.xyz/ws", isTestnet: true });
    await transport.ready();
    const client = new ExplorerClient({ transport });

    await fn(t, client)
      .finally(() => {
        transport.close();
      });
  });
}

// =============================================================================
// Helpers
// =============================================================================

/** Collects events for a fixed interval after asynchronous setup completes. */
export async function collectEventsOverTime<T>(
  fn: (cb: (event: T) => void) => void | Promise<void>,
  durationMs: number,
): Promise<T[]> {
  const data: T[] = [];
  await fn((event) => data.push(event));
  await new Promise((resolve) => setTimeout(resolve, durationMs));
  return data;
}
