// deno-lint-ignore-file no-import-prefix
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { RegisterReferrerRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";

runTest({
  name: "registerReferrer",
  codeTestFn: async (_t, exchClient) => {
    await assertRejects(
      async () => {
        await exchClient.registerReferrer({ code: "TEST" });
      },
      ApiRequestError,
      "Cannot generate referral code until enough volume traded",
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "registerReferrer",
      "--code=TESST",
    ]);
    v.parse(RegisterReferrerRequest, data);
  },
});
