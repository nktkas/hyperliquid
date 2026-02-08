import * as v from "@valibot/valibot";
import {
  type UserFundingsEvent,
  type UserFundingsParameters,
  UserFundingsRequest,
} from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/userFundings.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserFundingsEvent");
const paramsSchema = valibotToJsonSchema(v.omit(UserFundingsRequest, ["type"]));

runTest({
  name: "userFundings",
  mode: "api",
  fn: async (_t, client) => {
    const params: UserFundingsParameters[] = [
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" },
    ];

    const data = await collectEventsOverTime<UserFundingsEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.userFundings(p, cb)));
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/properties/isSnapshot/missing",
    ]);
  },
});
