import * as v from "@valibot/valibot";
import { NoopRequest, NoopResponse } from "@nktkas/hyperliquid/api/exchange";
import { excludeErrorResponse, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "noop",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.noop(),
    ]);
    schemaCoverage(excludeErrorResponse(NoopResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "noop",
    ]);
    v.parse(NoopRequest, data);
  },
});
