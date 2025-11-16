import { LiquidatableRequest, LiquidatableResponse, parser } from "../../../src/api/info/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "liquidatable",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.liquidatable(),
    ]);
    schemaCoverage(LiquidatableResponse, data, {
      ignoreEmptyArray: ["#"],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "liquidatable"]);
    parser(LiquidatableRequest)(JSON.parse(data));
  },
});
