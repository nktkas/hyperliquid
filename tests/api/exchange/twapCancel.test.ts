import * as v from "@valibot/valibot";
import { TwapCancelRequest } from "@nktkas/hyperliquid/api/exchange";
import { createTWAP, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/twapCancel.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "TwapCancelSuccessResponse");

runTest({
  name: "twapCancel",
  codeTestFn: async (_t, exchClient) => {
    // ========== Prepare ==========

    const twap = await createTWAP(exchClient);

    // ========== Test ==========

    const data = await Promise.all([
      exchClient.twapCancel({ a: twap.a, t: twap.twapId }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "twapCancel",
      "--a=0",
      "--t=0",
    ]);
    v.parse(TwapCancelRequest, data);
  },
});
