import { type SubAccountsParameters, SubAccountsRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/subAccounts.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "SubAccountsResponse");
const paramsSchema = valibotToJsonSchema(v.omit(SubAccountsRequest, ["type"]));

runTest({
  name: "subAccounts",
  codeTestFn: async (_t, client) => {
    const params: SubAccountsParameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, // length > 0
      { user: "0x0000000000000000000000000000000000000001" }, // null
    ];

    const data = await Promise.all(params.map((p) => client.subAccounts(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/anyOf/0/items/properties/clearinghouseState/properties/assetPositions/items/properties/position/properties/leverage/anyOf/0",
      "#/anyOf/0/items/properties/clearinghouseState/properties/assetPositions/items/properties/position/properties/liquidationPx/defined",
      "#/anyOf/0/items/properties/spotState/properties/evmEscrows/present",
    ]);
  },
});
