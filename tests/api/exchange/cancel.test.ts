import * as v from "@valibot/valibot";
import { CancelRequest } from "@nktkas/hyperliquid/api/exchange";
import { openOrder, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/cancel.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "CancelSuccessResponse");

runTest({
  name: "cancel",
  codeTestFn: async (_t, exchClient) => {
    // ========== Prepare ==========

    const order = await openOrder(exchClient, "limit");

    // ========== Test ==========

    const data = await Promise.all([
      exchClient.cancel({ cancels: [{ a: order.a, o: order.oid }] }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "cancel",
      `--cancels=${JSON.stringify([{ a: 0, o: 0 }])}`,
    ]);
    v.parse(CancelRequest, data);
  },
});
