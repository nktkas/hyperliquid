import { type UserFillsParameters, UserFillsRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userFills.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserFillsResponse");
const paramsSchema = valibotToJsonSchema(v.omit(UserFillsRequest, ["type"]));

runTest({
  name: "userFills",
  codeTestFn: async (_t, client) => {
    const params: UserFillsParameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
      { user: "0x8172cc20bc3a55dcd07c75dd37ac0c2534de3b84", aggregateByTime: true },
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", aggregateByTime: false },
    ];

    const data = await Promise.all(params.map((p) => client.userFills(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/items/properties/twapId/defined",
    ]);
  },
});
