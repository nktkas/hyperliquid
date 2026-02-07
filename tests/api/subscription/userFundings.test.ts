import type { UserFundingsEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/userFundings.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "UserFundingsEvent");

runTest({
  name: "userFundings",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<UserFundingsEvent>(async (cb) => {
      await client.userFundings({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, cb);
    }, 10_000);
    schemaCoverage(typeSchema, data, [
      "#/properties/isSnapshot/missing",
    ]);
  },
});
