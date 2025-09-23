import { MetaRequest, MetaResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "meta",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.meta(),
      client.meta({ dex: "test" }),
    ]);
    schemaCoverage(MetaResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "meta"]);
    parser(MetaRequest)(JSON.parse(data));
  },
});
