import { HttpTransport, InfoClient } from "../../../src/mod.ts";

// —————————— Arguments ——————————

const WAIT = 5000;

// —————————— Preparation ——————————

const transport = new HttpTransport({ isTestnet: true });
const client = new InfoClient({ transport });

// —————————— Test ——————————

export function runTest(options: {
  name: string;
  codeTestFn: (t: Deno.TestContext, client: InfoClient) => Promise<void>;
  cliTestFn?: (t: Deno.TestContext, runCommand: (args: string[]) => string | Promise<string>) => Promise<void>;
}): void {
  const { name, codeTestFn, cliTestFn } = options;

  Deno.test(name, async (t) => {
    await new Promise((r) => setTimeout(r, WAIT)); // delay to avoid rate limits

    await t.step("code", async (t) => {
      await codeTestFn(t, client);
    });

    await t.step({
      name: "cli",
      ignore: !cliTestFn,
      fn: async () => {
        await cliTestFn!(t, async (args) => {
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
        });
      },
    });
  });
}
