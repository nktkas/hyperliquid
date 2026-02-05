import * as v from "@valibot/valibot";
import { SetDisplayNameRequest, SetDisplayNameResponse } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { excludeErrorResponse, schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "setDisplayName",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.setDisplayName({ displayName: "" }),
    ]);
    schemaCoverage(excludeErrorResponse(SetDisplayNameResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "setDisplayName",
      "--displayName=test",
    ]);
    v.parse(SetDisplayNameRequest, data);
  },
});
