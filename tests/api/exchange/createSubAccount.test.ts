// deno-lint-ignore-file no-import-prefix
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { CreateSubAccountRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";

runTest({
  name: "createSubAccount",
  codeTestFn: async (_t, exchClient) => {
    await assertRejects(
      async () => {
        await exchClient.createSubAccount({ name: String(Date.now()) });
      },
      ApiRequestError,
      "Cannot create sub-accounts until enough volume traded",
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "createSubAccount",
      "--name=12345",
    ]);
    v.parse(CreateSubAccountRequest, data);
  },
});
