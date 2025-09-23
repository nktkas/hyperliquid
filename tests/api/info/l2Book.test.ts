import { L2BookRequest, L2BookResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "l2Book",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.l2Book({ coin: "ETH" }),
    ]);
    schemaCoverage(L2BookResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "l2Book", "--coin", "ETH"]);
    parser(L2BookRequest)(JSON.parse(data));
  },
});
