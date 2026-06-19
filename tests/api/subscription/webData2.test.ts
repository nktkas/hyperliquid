import { type WebData2Event, type WebData2Parameters, WebData2Request } from "@nktkas/hyperliquid/api/subscription";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/webData2.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "WebData2Event");
const paramsSchema = valibotToJsonSchema(v.omit(WebData2Request, ["type"]));

runTest({
  name: "webData2",
  mode: "api",
  fn: async (_t, client) => {
    const params: WebData2Parameters[] = [
      { user: "0x0000000000000000000000000000000000000000" },
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" },
      { user: "0x1defed46db35334232b9f5fd2e5c6180276fb99d" },
    ];

    const data = await collectEventsOverTime<WebData2Event>(async (cb) => {
      await Promise.all(params.map((p) => client.webData2(p, cb)));
    }, 10_000);

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
      "#/properties/agentAddress/defined",
      "#/properties/agentValidUntil/defined",
      "#/properties/openOrders/items/properties/children/*",
      "#/properties/spotState/properties/portfolioMarginEnabled/present",
      "#/properties/spotState/properties/portfolioMarginRatio/present",
      "#/properties/spotState/properties/tokenToPortfolioBorrowRatio/present",
      "#/properties/spotState/properties/tokenToAvailableAfterMaintenance/present",
      "#/properties/spotState/properties/balances/items/anyOf/0/properties/spotHold/present",
      "#/properties/spotState/properties/balances/items/anyOf/0/properties/ltv/present",
      "#/properties/spotState/properties/balances/items/anyOf/0/properties/borrowed/present",
      "#/properties/spotState/properties/balances/items/anyOf/0/properties/supplied/present",
    ]);
  },
});
