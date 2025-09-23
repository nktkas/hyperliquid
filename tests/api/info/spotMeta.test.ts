import { parser, SpotMetaRequest, SpotMetaResponse } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "spotMeta",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.spotMeta(),
    ]);
    schemaCoverage(SpotMetaResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "spotMeta"]);
    parser(SpotMetaRequest)(JSON.parse(data));
  },
});
