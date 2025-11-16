import test, { type TestContext } from "node:test";
import { execFileSync } from "node:child_process";
import { HttpTransport, InfoClient } from "../../../src/mod.ts";

// —————————— Arguments ——————————

const WAIT = 5000;

// —————————— Preparation ——————————

const transport = new HttpTransport({ isTestnet: true });
const client = new InfoClient({ transport });

// —————————— Test ——————————

export function runTest(options: {
  name: string;
  codeTestFn: (t: TestContext, client: InfoClient) => Promise<void>;
  cliTestFn?: (t: TestContext, runCommand: (args: string[]) => string) => Promise<void>;
}): void {
  const { name, codeTestFn, cliTestFn } = options;

  test(name, async (t) => {
    await new Promise((r) => setTimeout(r, WAIT)); // delay to avoid rate limits

    await t.test("code", async (t) => {
      await codeTestFn(t, client);
    });

    await t.test("cli", { skip: !cliTestFn }, async (t) => {
      // @ts-ignore: Deno is not defined in Node.js
      const isDeno = typeof globalThis.Deno !== "undefined";
      const command = isDeno ? "deno" : "node";
      const extraArgs = isDeno ? ["run", "-A"] : [];

      await cliTestFn!(t, (args) => {
        const output = execFileSync(
          command,
          [
            ...extraArgs,
            "bin/cli.ts",
            "--offline",
            ...args,
          ],
          { encoding: "utf8" },
        );

        if (output.startsWith("Hyperliquid CLI")) {
          throw new Error(`Invalid command argument(s)`);
        }

        return output;
      });
    });
  });
}
