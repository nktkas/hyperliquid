import * as v from "@valibot/valibot";
import { type UserFundingParameters, UserFundingRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userFunding.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserFundingResponse");
const paramsSchema = valibotToJsonSchema(v.omit(UserFundingRequest, ["type"]));

runTest({
  name: "userFunding",
  codeTestFn: async (_t, client) => {
    const now = Date.now();
    const year = 1000 * 60 * 60 * 24 * 365;
    const params: UserFundingParameters[] = [
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" },
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05", startTime: now - year },
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05", startTime: null },
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05", startTime: now - year, endTime: now },
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05", startTime: now - year, endTime: null },
    ];

    const data = await Promise.all(params.map((p) => client.userFunding(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userFunding",
      "--user=0xe019d6167E7e324aEd003d94098496b6d986aB05",
    ]);
    v.parse(UserFundingRequest, data);
  },
});
