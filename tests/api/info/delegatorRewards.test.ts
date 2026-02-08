import * as v from "@valibot/valibot";
import { type DelegatorRewardsParameters, DelegatorRewardsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/delegatorRewards.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "DelegatorRewardsResponse");
const paramsSchema = valibotToJsonSchema(v.omit(DelegatorRewardsRequest, ["type"]));

runTest({
  name: "delegatorRewards",
  codeTestFn: async (_t, client) => {
    const params: DelegatorRewardsParameters[] = [
      { user: "0xedc88158266c50628a9ffbaa1db2635376577eea" }, // source = delegation
      { user: "0x3c83a5cae32a05e88ca6a0350edb540194851a76" }, // source = commission
    ];

    const data = await Promise.all(params.map((p) => client.delegatorRewards(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
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
