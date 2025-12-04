import * as v from "@valibot/valibot";
import { PerpDexsRequest, PerpDexsResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "perpDexs",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.perpDexs(),
    ]);
    schemaCoverage(PerpDexsResponse, data, {
      ignoreDefinedTypes: [
        "#/items/wrapped/properties/oracleUpdater",
      ],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "perpDexs",
    ]);
    v.parse(PerpDexsRequest, data);
  },
});
