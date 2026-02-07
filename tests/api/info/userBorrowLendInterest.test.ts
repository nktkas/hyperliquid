import * as v from "@valibot/valibot";
import { UserBorrowLendInterestRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userBorrowLendInterest.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "UserBorrowLendInterestResponse");

runTest({
  name: "userBorrowLendInterest",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userBorrowLendInterest({
        user: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
        startTime: Date.now() - 1000 * 60 * 60 * 24 * 365 * 5,
      }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userBorrowLendInterest",
      "--user=0xe019d6167E7e324aEd003d94098496b6d986aB05",
      "--startTime=1725991229384",
    ]);
    v.parse(UserBorrowLendInterestRequest, data);
  },
});
