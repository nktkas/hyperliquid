import * as v from "@valibot/valibot";
import { Withdraw3Request } from "@nktkas/hyperliquid/api/exchange";
import { runTest, topUpPerp } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/withdraw3.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "Withdraw3SuccessResponse");

runTest({
  name: "withdraw3",
  codeTestFn: async (_t, exchClient) => {
    // ========== Prepare ==========

    await topUpPerp(exchClient, "2");

    // ========== Test ==========

    const data = await Promise.all([
      exchClient.withdraw3({
        amount: "2",
        destination: "0x0000000000000000000000000000000000000001",
      }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "withdraw3",
      "--amount=2",
      "--destination=0x0000000000000000000000000000000000000001",
    ]);
    v.parse(Withdraw3Request, data);
  },
});
