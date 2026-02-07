import * as v from "@valibot/valibot";
import { DelegatorRewardsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/delegatorRewards.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "DelegatorRewardsResponse");

runTest({
  name: "delegatorRewards",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.delegatorRewards({ user: "0xedc88158266c50628a9ffbaa1db2635376577eea" }), // source = delegation
      client.delegatorRewards({ user: "0x3c83a5cae32a05e88ca6a0350edb540194851a76" }), // source = commission
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "delegatorRewards",
      "--user=0xedc88158266c50628a9ffbaa1db2635376577eea",
    ]);
    v.parse(DelegatorRewardsRequest, data);
  },
});
