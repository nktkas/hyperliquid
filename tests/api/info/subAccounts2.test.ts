import * as v from "@valibot/valibot";
import { type SubAccounts2Parameters, SubAccounts2Request } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/subAccounts2.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "SubAccounts2Response");
const paramsSchema = valibotToJsonSchema(v.omit(SubAccounts2Request, ["type"]));

runTest({
  name: "subAccounts2",
  codeTestFn: async (_t, client) => {
    const params: SubAccounts2Parameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, // length > 0
      { user: "0x0000000000000000000000000000000000000001" }, // null
    ];

    const data = await Promise.all(params.map((p) => client.subAccounts2(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/anyOf/0/items/properties/dexToClearinghouseState/items/items/1/properties/assetPositions/items/properties/position/properties/leverage/anyOf/0",
      "#/anyOf/0/items/properties/dexToClearinghouseState/items/items/1/properties/assetPositions/items/properties/position/properties/liquidationPx/defined",
      "#/anyOf/0/items/properties/spotState/properties/evmEscrows/present",
    ]);
  },
});
