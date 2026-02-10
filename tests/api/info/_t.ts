import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

// =============================================================
// Arguments
// =============================================================

const WAIT = 5000;

// =============================================================
// Preparation
// =============================================================

const transport = new HttpTransport({ isTestnet: true });
const client = new InfoClient({ transport });

// =============================================================
// Test
// =============================================================

export function runTest(options: {
  name: string;
  codeTestFn: (t: Deno.TestContext, client_: typeof client) => Promise<void>;
}): void {
  const { name, codeTestFn } = options;

  Deno.test(name, async (t) => {
    await new Promise((r) => setTimeout(r, WAIT)); // delay to avoid rate limits

    await codeTestFn(t, client);
  });
}
