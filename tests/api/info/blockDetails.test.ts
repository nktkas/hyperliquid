import { BlockDetailsRequest, BlockDetailsResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "blockDetails",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.blockDetails({ height: 300836507 }),
    ]);
    schemaCoverage(BlockDetailsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "blockDetails", "--height", "300836507"]);
    parser(BlockDetailsRequest)(JSON.parse(data));
  },
});
