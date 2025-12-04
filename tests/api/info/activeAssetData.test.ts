import * as v from "@valibot/valibot";
import { ActiveAssetDataRequest, ActiveAssetDataResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "activeAssetData",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.activeAssetData({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", coin: "BTC" }), // leverage.type = isolated
      client.activeAssetData({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", coin: "NEAR" }), // leverage.type = cross
    ]);
    schemaCoverage(ActiveAssetDataResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "activeAssetData",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
      "--coin=BTC",
    ]);
    v.parse(ActiveAssetDataRequest, data);
  },
});
