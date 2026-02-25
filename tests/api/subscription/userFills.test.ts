import { type UserFillsEvent, type UserFillsParameters, UserFillsRequest } from "@nktkas/hyperliquid/api/subscription";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/userFills.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserFillsEvent");
const paramsSchema = valibotToJsonSchema(v.omit(UserFillsRequest, ["type"]));

runTest({
  name: "userFills",
  mode: "api",
  fn: async (_t, client) => {
    const params: UserFillsParameters[] = [
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" },
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", aggregateByTime: true },
    ];

    const data = await collectEventsOverTime<UserFillsEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.userFills(p, cb)));
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/properties/fills/items/properties/builderFee/present",
      "#/properties/fills/items/properties/twapId/defined",
      "#/properties/isSnapshot/missing",
    ]);
  },
});
