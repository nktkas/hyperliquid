// deno-lint-ignore-file no-import-prefix
import { CSignerActionRequest, parser } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertRejects } from "jsr:@std/assert@1";
import { runTest } from "./_t.ts";

runTest({
  name: "cSignerAction",
  codeTestFn: async (t, clients) => {
    await t.step("jailSelf", async () => {
      await assertRejects(
        async () => {
          await clients.exchange.cSignerAction({ jailSelf: null });
        },
        ApiRequestError,
        "Signer invalid or inactive for current epoch",
      );
    });

    await t.step("unjailSelf", async () => {
      await assertRejects(
        async () => {
          await clients.exchange.cSignerAction({ unjailSelf: null });
        },
        ApiRequestError,
        "Signer invalid or inactive for current epoch",
      );
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "cSignerAction", "--jailSelf", "null"]);
    parser(CSignerActionRequest)(JSON.parse(data));
  },
});
