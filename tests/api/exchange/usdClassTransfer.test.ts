import * as v from "@valibot/valibot";
import { UsdClassTransferRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/usdClassTransfer.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "UsdClassTransferSuccessResponse");

runTest({
  name: "usdClassTransfer",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.usdClassTransfer({ amount: "1", toPerp: false }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "usdClassTransfer",
      "--amount=1",
      "--toPerp=false",
    ]);
    v.parse(UsdClassTransferRequest, data);
  },
});
