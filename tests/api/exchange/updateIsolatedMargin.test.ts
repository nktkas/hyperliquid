import * as v from "@valibot/valibot";
import { UpdateIsolatedMarginRequest } from "@nktkas/hyperliquid/api/exchange";
import { openOrder, runTest, symbolConverter } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/updateIsolatedMargin.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "UpdateIsolatedMarginSuccessResponse");

runTest({
  name: "updateIsolatedMargin",
  codeTestFn: async (t, exchClient) => {
    // ========== Prepare ==========

    const id = symbolConverter.getAssetId("SOL")!;
    await exchClient.updateLeverage({ asset: id, isCross: false, leverage: 1 });
    await openOrder(exchClient, "market", "SOL");

    // ========== Test ==========

    await t.step("Increase isolated margin", async () => {
      const data = await Promise.all([
        exchClient.updateIsolatedMargin({ asset: id, isBuy: true, ntli: 2 * 1e6 }),
      ]);
      schemaCoverage(typeSchema, data);
    });

    await t.step("Decrease isolated margin", async () => {
      const data = await Promise.all([
        exchClient.updateIsolatedMargin({ asset: id, isBuy: true, ntli: -1 * 1e6 }),
      ]);
      schemaCoverage(typeSchema, data);
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "updateIsolatedMargin",
      "--asset=0",
      "--isBuy=true",
      "--ntli=1",
    ]);
    v.parse(UpdateIsolatedMarginRequest, data);
  },
});
