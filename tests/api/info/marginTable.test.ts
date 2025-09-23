import { MarginTableRequest, MarginTableResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "marginTable",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.marginTable({ id: 1 }),
    ]);
    schemaCoverage(MarginTableResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "marginTable", "--id", "1"]);
    parser(MarginTableRequest)(JSON.parse(data));
  },
});
