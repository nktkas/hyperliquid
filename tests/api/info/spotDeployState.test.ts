import { type SpotDeployStateParameters, SpotDeployStateRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/spotDeployState.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "SpotDeployStateResponse");
const paramsSchema = valibotToJsonSchema(v.omit(SpotDeployStateRequest, ["type"]));

runTest({
  name: "spotDeployState",
  codeTestFn: async (_t, client) => {
    const params: SpotDeployStateParameters[] = [
      { user: "0x051dbfc562d44e4a01ebb986da35a47ab4f346db" }, // states.fullName = string, states.maxSupply = string
      { user: "0xd8cb8d9747f50be8e423c698f9104ee090540961" }, // states.fullName = null, states.maxSupply = null
    ];

    const data = await Promise.all(params.map((p) => client.spotDeployState(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/properties/states/items/properties/blacklistUsers/array",
      "#/properties/gasAuction/properties/currentGas/defined",
      "#/properties/gasAuction/properties/endGas/null",
      "#/properties/gasAuction/properties/currentGas/null",
      "#/properties/gasAuction/properties/endGas/defined",
    ]);
  },
});
