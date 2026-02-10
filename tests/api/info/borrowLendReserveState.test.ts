import * as v from "@valibot/valibot";
import { type BorrowLendReserveStateParameters, BorrowLendReserveStateRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/borrowLendReserveState.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "BorrowLendReserveStateResponse");
const paramsSchema = valibotToJsonSchema(v.omit(BorrowLendReserveStateRequest, ["type"]));

runTest({
  name: "borrowLendReserveState",
  codeTestFn: async (_t, client) => {
    const params: BorrowLendReserveStateParameters[] = [
      { token: 0 },
    ];

    const data = await Promise.all(params.map((p) => client.borrowLendReserveState(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
