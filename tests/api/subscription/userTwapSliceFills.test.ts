import type { UserTwapSliceFillsEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/userTwapSliceFills.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "UserTwapSliceFillsEvent");

runTest({
  name: "userTwapSliceFills",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<UserTwapSliceFillsEvent>(async (cb) => {
      await client.userTwapSliceFills({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
      await client.userTwapSliceFills({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, cb);
    }, 10_000);
    schemaCoverage(typeSchema, data, [
      "#/properties/twapSliceFills/items/properties/fill/properties/builderFee/present",
      "#/properties/twapSliceFills/items/properties/fill/properties/twapId/defined",
      "#/properties/isSnapshot/missing",
    ]);
  },
});
