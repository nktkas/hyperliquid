// deno-lint-ignore-file no-import-prefix
import { parser, SpotUserRequest, SuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "spotUser",
  codeTestFn: async (_t, clients) => {
    await Promise.all([
      clients.exchange.spotUser({ toggleSpotDusting: { optOut: true } }),
    ])
      .then((data) => {
        schemaCoverage(SuccessResponse, data);
      }).catch((e) => {
        if (e instanceof SchemaCoverageError) throw e;
        assertIsError(e, ApiRequestError, "Already opted out of spot dusting");
      });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "spotUser", "--optOut", "true"]);
    parser(SpotUserRequest)(JSON.parse(data));
  },
});
