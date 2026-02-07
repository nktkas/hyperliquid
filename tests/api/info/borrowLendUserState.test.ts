import * as v from "@valibot/valibot";
import { BorrowLendUserStateRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/borrowLendUserState.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "BorrowLendUserStateResponse");

runTest({
  name: "borrowLendUserState",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.borrowLendUserState({ user: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1" }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "borrowLendUserState",
      "--user=0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
    ]);
    v.parse(BorrowLendUserStateRequest, data);
  },
});
