import assert from "node:assert";
import { parser, RegisterReferrerRequest } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "registerReferrer",
  codeTestFn: async (_t, exchClient) => {
    await assert.rejects(
      async () => {
        await exchClient.registerReferrer({ code: "TEST" });
      },
      (e) =>
        e instanceof ApiRequestError && e.message.includes("Cannot generate referral code until enough volume traded"),
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "registerReferrer", "--code", "TEST"]);
    parser(RegisterReferrerRequest)(data);
  },
});
