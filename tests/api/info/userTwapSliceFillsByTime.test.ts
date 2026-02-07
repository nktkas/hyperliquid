import * as v from "@valibot/valibot";
import { UserTwapSliceFillsByTimeRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userTwapSliceFillsByTime.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "UserTwapSliceFillsByTimeResponse");

runTest({
  name: "userTwapSliceFillsByTime",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userTwapSliceFillsByTime({
        user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
        startTime: Date.now() - 1000 * 60 * 60 * 24 * 365 * 5,
      }),
    ]);
    schemaCoverage(typeSchema, data, [
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
