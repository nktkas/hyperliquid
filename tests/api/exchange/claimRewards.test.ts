import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { ClaimRewardsRequest } from "@nktkas/hyperliquid/api/exchange";
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
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "claimRewards",
    ]);
    v.parse(ClaimRewardsRequest, data);
  },
});
