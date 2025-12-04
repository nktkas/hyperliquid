import * as v from "@valibot/valibot";
import { UserFeesRequest, UserFeesResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "userFees",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userFees({ user: "0xe973105a27e17350500926ae664dfcfe6006d924" }),
    ]);
    schemaCoverage(UserFeesResponse, data, {
      ignoreDefinedTypes: [
        "#/properties/trial",
        "#/properties/nextTrialAvailableTimestamp",
        "#/properties/stakingLink",
      ],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userFees",
      "--user=0xe973105a27e17350500926ae664dfcfe6006d924",
    ]);
    v.parse(UserFeesRequest, data);
  },
});
