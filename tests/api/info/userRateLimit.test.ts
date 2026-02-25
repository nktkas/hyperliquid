import { type UserRateLimitParameters, UserRateLimitRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userRateLimit.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserRateLimitResponse");
const paramsSchema = valibotToJsonSchema(v.omit(UserRateLimitRequest, ["type"]));

runTest({
  name: "userRateLimit",
  codeTestFn: async (_t, client) => {
    const params: UserRateLimitParameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
    ];

    const data = await Promise.all(params.map((p) => client.userRateLimit(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
