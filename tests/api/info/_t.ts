import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

// ============================================================
// Arguments
// ============================================================

const WAIT = 5000;
const OFFLINE = Deno.args.includes("--offline");

// ============================================================
// Preparation
// ============================================================

const transport = new HttpTransport({ isTestnet: true, timeout: 30_000 });
const client = new InfoClient({ transport });

// ============================================================
// Test
// ============================================================

/**
 * Runs an info API test with rate-limit delay and shared client.
 *
 * @param options Test options including name and test function
 * @param options.name Name of the test
 * @param options.ignore Whether to skip the test
 * @param options.codeTestFn Async function containing the test code, receives Deno.TestContext and shared InfoClient
 */
export function runTest(options: {
  name: string;
  ignore?: boolean;
  codeTestFn: (t: Deno.TestContext, client_: typeof client) => Promise<void>;
}): void {
  const { name, ignore, codeTestFn } = options;

  Deno.test(name, { ignore: OFFLINE || ignore }, async (t) => {
    await new Promise((r) => setTimeout(r, WAIT)); // delay to avoid rate limits

    await codeTestFn(t, client);
  });
}
