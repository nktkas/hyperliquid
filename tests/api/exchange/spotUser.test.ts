import * as v from "@valibot/valibot";
import { SpotUserRequest, SpotUserResponse } from "@nktkas/hyperliquid/api/exchange";
import { excludeErrorResponse, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "spotUser",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.spotUser({ toggleSpotDusting: { optOut: true } }),
    ]);
    schemaCoverage(excludeErrorResponse(SpotUserResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "spotUser",
      `--toggleSpotDusting=${JSON.stringify({ optOut: true })}`,
    ]);
    v.parse(SpotUserRequest, data);
  },
});
