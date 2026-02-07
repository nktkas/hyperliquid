import * as v from "@valibot/valibot";
import { BorrowLendReserveStateRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/borrowLendReserveState.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "BorrowLendReserveStateResponse");

runTest({
  name: "borrowLendReserveState",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.borrowLendReserveState({ token: 0 }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "borrowLendReserveState",
      "--token=0",
    ]);
    v.parse(BorrowLendReserveStateRequest, data);
  },
});
