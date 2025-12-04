// deno-lint-ignore-file no-import-prefix
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { CSignerActionRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";

runTest({
  name: "cSignerAction",
  codeTestFn: async (t, exchClient) => {
    await t.step("jailSelf", async () => {
      await assertRejects(
        async () => {
          await exchClient.cSignerAction({ jailSelf: null });
        },
        ApiRequestError,
        "Signer invalid or inactive for current epoch",
      );
    });

    await t.step("unjailSelf", async () => {
      await assertRejects(
        async () => {
          await exchClient.cSignerAction({ unjailSelf: null });
        },
        ApiRequestError,
        "Signer invalid or inactive for current epoch",
      );
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "cSignerAction",
      "--jailSelf=null",
    ]);
    v.parse(CSignerActionRequest, data);
  },
});
