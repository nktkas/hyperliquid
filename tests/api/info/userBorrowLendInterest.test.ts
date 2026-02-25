import { type UserBorrowLendInterestParameters, UserBorrowLendInterestRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userBorrowLendInterest.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserBorrowLendInterestResponse");
const paramsSchema = valibotToJsonSchema(v.omit(UserBorrowLendInterestRequest, ["type"]));

runTest({
  name: "userBorrowLendInterest",
  codeTestFn: async (_t, client) => {
    const now = Date.now();
    const fiveYears = 1000 * 60 * 60 * 24 * 365 * 5;
    const params: UserBorrowLendInterestParameters[] = [
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05", startTime: now - fiveYears },
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05", startTime: now - fiveYears, endTime: now },
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05", startTime: now - fiveYears, endTime: null },
    ];

    const data = await Promise.all(params.map((p) => client.userBorrowLendInterest(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
