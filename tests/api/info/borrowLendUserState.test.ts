import * as v from "@valibot/valibot";
import { type BorrowLendUserStateParameters, BorrowLendUserStateRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/borrowLendUserState.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "BorrowLendUserStateResponse");
const paramsSchema = valibotToJsonSchema(v.omit(BorrowLendUserStateRequest, ["type"]));

runTest({
  name: "borrowLendUserState",
  codeTestFn: async (_t, client) => {
    const params: BorrowLendUserStateParameters[] = [
      { user: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1" },
    ];

    const data = await Promise.all(params.map((p) => client.borrowLendUserState(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
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
