import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/allBorrowLendReserveStates.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "AllBorrowLendReserveStatesResponse");

runTest({
  name: "allBorrowLendReserveStates",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.allBorrowLendReserveStates()]);

    schemaCoverage(responseSchema, data);
  },
});
