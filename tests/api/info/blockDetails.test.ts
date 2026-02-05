import * as v from "@valibot/valibot";
import { BlockDetailsRequest, BlockDetailsResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "blockDetails",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.blockDetails({ height: 300836507 }),
    ]);
    schemaCoverage(BlockDetailsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "blockDetails",
      "--height=300836507",
    ]);
    v.parse(BlockDetailsRequest, data);
  },
});
