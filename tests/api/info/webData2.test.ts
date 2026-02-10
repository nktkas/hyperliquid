import * as v from "@valibot/valibot";
import { type WebData2Parameters, WebData2Request } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/webData2.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "WebData2Response");
const paramsSchema = valibotToJsonSchema(v.omit(WebData2Request, ["type"]));

runTest({
  name: "webData2",
  codeTestFn: async (_t, client) => {
    const params: WebData2Parameters[] = [
      { user: "0x0000000000000000000000000000000000000000" },
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" },
      { user: "0x1defed46db35334232b9f5fd2e5c6180276fb99d" },
    ];

    const data = await Promise.all(params.map((p) => client.webData2(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/properties/openOrders/items/properties/orderType/enum/0",
      "#/properties/openOrders/items/properties/orderType/enum/4",
      "#/properties/openOrders/items/properties/orderType/enum/5",
      "#/properties/openOrders/items/properties/tif/enum/1",
      "#/properties/openOrders/items/properties/tif/enum/3",
      "#/properties/openOrders/items/properties/tif/enum/4",
      "#/properties/openOrders/items/properties/tif/enum/5",
      "#/properties/openOrders/items/properties/cloid/defined",
      "#/properties/meta/properties/universe/items/properties/marginMode/enum/1",
      "#/properties/meta/properties/universe/items/properties/growthMode/present",
      "#/properties/meta/properties/universe/items/properties/lastGrowthModeChangeTime/present",
      "#/properties/twapStates/array",
      "#/properties/perpsAtOpenInterestCap/present",
    ]);
  },
});
