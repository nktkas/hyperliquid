import { assertRejects } from "jsr:@std/assert@1";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";

runTest({
  name: "claimRewards",
  codeTestFn: async (_t, exchClient) => {
    await assertRejects(
      async () => {
        await exchClient.claimRewards();
      },
      ApiRequestError,
      "No rewards to claim",
    );
  },
});
