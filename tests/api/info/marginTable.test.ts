import * as v from "@valibot/valibot";
import { MarginTableRequest, MarginTableResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "marginTable",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.marginTable({ id: 1 }),
    ]);
    schemaCoverage(MarginTableResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "marginTable",
      "--id=1",
    ]);
    v.parse(MarginTableRequest, data);
  },
});
