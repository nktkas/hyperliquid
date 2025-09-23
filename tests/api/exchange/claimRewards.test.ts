// deno-lint-ignore-file no-import-prefix
import { ClaimRewardsRequest, parser, SuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "claimRewards",
  codeTestFn: async (_t, clients) => {
    await Promise.all([
      clients.exchange.claimRewards(),
    ])
      .then((data) => {
        schemaCoverage(SuccessResponse, data);
      }).catch((e) => {
        if (e instanceof SchemaCoverageError) throw e;
        assertIsError(e, ApiRequestError, "No rewards to claim");
      });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "claimRewards"]);
    parser(ClaimRewardsRequest)(JSON.parse(data));
  },
});
