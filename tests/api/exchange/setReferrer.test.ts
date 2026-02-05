import * as v from "@valibot/valibot";
import { SetReferrerRequest, SetReferrerResponse } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { excludeErrorResponse, schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "setReferrer",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.setReferrer({ code: "TEST" }),
    ]);
    schemaCoverage(excludeErrorResponse(SetReferrerResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "setReferrer",
      "--code=TEST",
    ]);
    v.parse(SetReferrerRequest, data);
  },
});
