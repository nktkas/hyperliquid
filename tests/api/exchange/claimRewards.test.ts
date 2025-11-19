import assert from "node:assert";
import { ClaimRewardsRequest, parser } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "claimRewards",
  codeTestFn: async (_t, exchClient) => {
    await assert.rejects(
      async () => {
        await exchClient.claimRewards();
      },
      (e) => e instanceof ApiRequestError && e.message.includes("No rewards to claim"),
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "claimRewards"]);
    parser(ClaimRewardsRequest)(data);
  },
});
