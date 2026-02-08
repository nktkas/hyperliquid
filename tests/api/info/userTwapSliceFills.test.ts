import * as v from "@valibot/valibot";
import { type UserTwapSliceFillsParameters, UserTwapSliceFillsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userTwapSliceFills.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserTwapSliceFillsResponse");
const paramsSchema = valibotToJsonSchema(v.omit(UserTwapSliceFillsRequest, ["type"]));

runTest({
  name: "userTwapSliceFills",
  codeTestFn: async (_t, client) => {
    const params: UserTwapSliceFillsParameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
    ];

    const data = await Promise.all(params.map((p) => client.userTwapSliceFills(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/items/properties/fill/properties/builderFee/present",
      "#/items/properties/fill/properties/twapId/defined",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userTwapSliceFills",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(UserTwapSliceFillsRequest, data);
  },
});
