import { type WebData3Event, type WebData3Parameters, WebData3Request } from "@nktkas/hyperliquid/api/subscription";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/webData3.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "WebData3Event");
const paramsSchema = valibotToJsonSchema(v.omit(WebData3Request, ["type"]));

runTest({
  name: "webData3",
  mode: "api",
  fn: async (_t, client) => {
    const params: WebData3Parameters[] = [
      { user: "0x0000000000000000000000000000000000000000" },
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" },
      { user: "0x6b043579b088d44400dffa1ef1c5e3e3bfbdf9d2" }, // portfolioMargin
      { user: "0x8c9c52889ab9d259195a52fd412c250f8183c960" }, // unifiedAccount
    ];

    const data = await collectEventsOverTime<WebData3Event>(async (cb) => {
      await Promise.all(params.map((p) => client.webData3(p, cb)));
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data.flat());
  },
});
