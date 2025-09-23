// deno-lint-ignore-file no-import-prefix
import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

// —————————— Arguments ——————————

const cliArgs = parseArgs(Deno.args, { default: { wait: 0 }, string: ["_"] }) as Args<{ wait: number }>;

// —————————— Clients ——————————

const infoClient = new InfoClient({ transport: new HttpTransport({ isTestnet: true }) });

// —————————— Functions ——————————

export function runTest(options: {
  name: string;
  codeTestFn: (t: Deno.TestContext, client: InfoClient) => Promise<void>;
  cliTestFn?: (t: Deno.TestContext, runCommand: (args: string[]) => Promise<string>) => Promise<void>;
}): void {
  const { name, codeTestFn, cliTestFn } = options;

  Deno.test(name, async (t) => {
    await new Promise((r) => setTimeout(r, cliArgs.wait)); // delay to avoid rate limits

    await t.step("Code", async (t) => {
      await codeTestFn(t, infoClient);
    });

    await t.step({
      name: "CLI",
      fn: async (t) => {
        await cliTestFn!(t, async (args: string[]) => {
          const command = new Deno.Command("deno", {
            args: ["run", "-A", "bin/cli.ts", "--offline", ...args],
            stdout: "piped",
            stderr: "piped",
          });
          const { stdout, stderr } = await command.output();
          const error = new TextDecoder().decode(stderr);
          if (error !== "") {
            throw new Error(`Command failed with error: ${error}`);
          }
          const output = new TextDecoder().decode(stdout);
          if (output.startsWith("Hyperliquid CLI")) {
            throw new Error(`Invalid command argument(s)`);
          }
          return output;
        });
      },
      ignore: cliTestFn === undefined,
    });
  });
}
