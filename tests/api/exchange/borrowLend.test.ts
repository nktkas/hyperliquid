import * as v from "@valibot/valibot";
import { BorrowLendRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest, topUpSpot } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/borrowLend.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "BorrowLendSuccessResponse");

runTest({
  name: "borrowLend",
  codeTestFn: async (t, exchClient) => {
    // ========== Prepare ==========

    await topUpSpot(exchClient, "USDC", "30");

    // ========== Test ==========

    await t.step("supply", async () => {
      const data = await Promise.all([
        exchClient.borrowLend({ operation: "supply", token: 0, amount: "30" }),
      ]);
      schemaCoverage(typeSchema, data);
    });

    await t.step("withdraw", async () => {
      const data = await Promise.all([
        exchClient.borrowLend({ operation: "withdraw", token: 0, amount: null }),
      ]);
      schemaCoverage(typeSchema, data);
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "borrowLend",
      "--operation=supply",
      "--token=0",
      "--amount=30",
    ]);
    v.parse(BorrowLendRequest, data);
  },
});
