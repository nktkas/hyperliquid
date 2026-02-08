import * as v from "@valibot/valibot";
import { type UserTwapSliceFillsByTimeParameters, UserTwapSliceFillsByTimeRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userTwapSliceFillsByTime.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserTwapSliceFillsByTimeResponse");
const paramsSchema = valibotToJsonSchema(v.omit(UserTwapSliceFillsByTimeRequest, ["type"]));

runTest({
  name: "userTwapSliceFillsByTime",
  codeTestFn: async (_t, client) => {
    const now = Date.now();
    const fiveYears = 1000 * 60 * 60 * 24 * 365 * 5;
    const params: UserTwapSliceFillsByTimeParameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", startTime: now - fiveYears }, // endTime absent, aggregateByTime absent
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", startTime: now - fiveYears, endTime: now }, // endTime present
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", startTime: now - fiveYears, endTime: null }, // endTime null
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", startTime: now - fiveYears, aggregateByTime: true }, // aggregateByTime true
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", startTime: now - fiveYears, aggregateByTime: false }, // aggregateByTime false
    ];

    const data = await Promise.all(params.map((p) => client.userTwapSliceFillsByTime(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/items/properties/fill/properties/builderFee/present",
      "#/items/properties/fill/properties/twapId/defined",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userTwapSliceFillsByTime",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
      "--startTime=1725991238683",
    ]);
    v.parse(UserTwapSliceFillsByTimeRequest, data);
  },
});
