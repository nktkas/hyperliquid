import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

// ============================================================
// Arguments
// ============================================================

const WAIT = 5000;
const OFFLINE = Deno.args.includes("--offline");

// ============================================================
// Preparation
// ============================================================

const testnetClient = new InfoClient({ transport: new HttpTransport({ isTestnet: true, timeout: 30_000 }) });
const mainnetClient = new InfoClient({ transport: new HttpTransport({ timeout: 30_000 }) });

// ============================================================
// Test
// ============================================================

/**
 * Runs an info API test with rate-limit delay and shared client.
 *
 * @param options Test options including name and test function
 * @param options.name Name of the test
 * @param options.ignore Whether to skip the test
 * @param options.isTestnet Uses the testnet API when true; defaults to `true`
 * @param options.codeTestFn Async function containing the test code, receives Deno.TestContext and shared InfoClient
 */
export function runTest(options: {
  name: string;
  ignore?: boolean;
  isTestnet?: boolean;
  codeTestFn: (t: Deno.TestContext, client_: typeof testnetClient) => Promise<void>;
}): void {
  const { name, ignore, isTestnet = true, codeTestFn } = options;

  Deno.test(name, { ignore: OFFLINE || ignore }, async (t) => {
    await new Promise((r) => setTimeout(r, WAIT)); // delay to avoid rate limits

    await codeTestFn(t, isTestnet ? testnetClient : mainnetClient);
  });
}
