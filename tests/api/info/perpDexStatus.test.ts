import * as v from "@valibot/valibot";
import { PerpDexStatusRequest, PerpDexStatusResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "perpDexStatus",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.perpDexStatus({ dex: "test" }),
    ]);
    schemaCoverage(PerpDexStatusResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "perpDexStatus",
      "--dex=test",
    ]);
    v.parse(PerpDexStatusRequest, data);
  },
});
