import * as v from "@valibot/valibot";
import { CancelByCloidRequest } from "@nktkas/hyperliquid/api/exchange";
import { openOrder, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/cancelByCloid.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "CancelByCloidSuccessResponse");

runTest({
  name: "cancelByCloid",
  codeTestFn: async (_t, exchClient) => {
    // ========== Prepare ==========

    const order = await openOrder(exchClient, "limit");

    // ========== Test ==========

    const data = await Promise.all([
      exchClient.cancelByCloid({ cancels: [{ asset: order.a, cloid: order.cloid }] }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "cancelByCloid",
      `--cancels=${JSON.stringify([{ asset: 0, cloid: "0x17a5a40306205a0c6d60c7264153781c" }])}`,
    ]);
    v.parse(CancelByCloidRequest, data);
  },
});
