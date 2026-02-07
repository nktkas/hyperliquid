import * as v from "@valibot/valibot";
import { ActiveAssetDataRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/activeAssetData.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "ActiveAssetDataResponse");

runTest({
  name: "activeAssetData",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.activeAssetData({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", coin: "BTC" }), // leverage.type = isolated
      client.activeAssetData({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", coin: "NEAR" }), // leverage.type = cross
    ]);
    schemaCoverage(typeSchema, data);
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
