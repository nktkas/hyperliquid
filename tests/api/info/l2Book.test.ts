import * as v from "@valibot/valibot";
import { L2BookRequest, L2BookResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "l2Book",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.l2Book({ coin: "ETH" }),
      client.l2Book({ coin: "NONE/EXISTENT" }),
    ]);
    schemaCoverage(L2BookResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "l2Book",
      "--coin=ETH",
    ]);
    v.parse(L2BookRequest, data);
  },
});
