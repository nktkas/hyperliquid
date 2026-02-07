import type { WebData3Event } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/webData3.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "WebData3Event");

runTest({
  name: "webData3",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<WebData3Event>(async (cb) => {
      await client.webData3({ user: "0x0000000000000000000000000000000000000000" }, cb);
      await client.webData3({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
      await client.webData3({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, cb);
      await client.webData3({ user: "0x6b043579b088d44400dffa1ef1c5e3e3bfbdf9d2" }, cb); // portfolioMargin
      await client.webData3({ user: "0x8c9c52889ab9d259195a52fd412c250f8183c960" }, cb); // unifiedAccount
    }, 10_000);
    schemaCoverage(typeSchema, data.flat());
  },
});
