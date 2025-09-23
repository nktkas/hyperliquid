import { parser, UserFeesRequest, UserFeesResponse } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "userFees",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userFees({ user: "0xe973105a27e17350500926ae664dfcfe6006d924" }),
    ]);
    schemaCoverage(UserFeesResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "userFees", "--user", "0xe973105a27e17350500926ae664dfcfe6006d924"]);
    parser(UserFeesRequest)(JSON.parse(data));
  },
});
