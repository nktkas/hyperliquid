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

/**
 * Help function to run SDK CLI commands
 * @throws {Error} When CLI returns an error message
 */
async function runCLICommand(args: string[]): Promise<string> {
  const command = new Deno.Command("deno", {
    args: ["run", "-A", "bin/cli.ts", "--offline", ...args],
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
  codeTestFn: (t: Deno.TestContext, client_: typeof client) => Promise<void>;
  cliTestFn?: (t: Deno.TestContext, runCommand: (args: string[]) => unknown | Promise<unknown>) => Promise<void>;
}): void {
  const { name, codeTestFn, cliTestFn } = options;

  Deno.test(name, async (t) => {
    await new Promise((r) => setTimeout(r, WAIT)); // delay to avoid rate limits

    // Test related to client interaction
    await t.step("code", async (t) => {
      await codeTestFn(t, client);
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
