import * as v from "@valibot/valibot";
import { CDepositRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest, topUpSpot } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/cDeposit.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "CDepositSuccessResponse");

runTest({
  name: "cDeposit",
  codeTestFn: async (_t, exchClient) => {
    // ========== Prepare ==========

    await topUpSpot(exchClient, "HYPE", "0.00000001");

    // ========== Test ==========

    const data = await Promise.all([
      exchClient.cDeposit({ wei: 1 }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "cDeposit",
      "--wei=1",
    ]);
    v.parse(CDepositRequest, data);
  },
});
