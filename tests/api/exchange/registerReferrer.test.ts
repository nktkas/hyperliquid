// deno-lint-ignore-file no-import-prefix
import { assertRejects } from "jsr:@std/assert@1";
import { parser, RegisterReferrerRequest } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
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
