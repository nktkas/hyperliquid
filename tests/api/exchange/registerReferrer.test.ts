// deno-lint-ignore-file no-import-prefix
import { parser, RegisterReferrerRequest } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertRejects } from "jsr:@std/assert@1";
import { runTest } from "./_t.ts";

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
    const data = await runCommand(["exchange", "registerReferrer", "--code", "TEST"]);
    parser(RegisterReferrerRequest)(data);
  },
});
