import * as v from "@valibot/valibot";
import { UsdSendRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/usdSend.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "UsdSendSuccessResponse");

runTest({
  name: "usdSend",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.usdSend({
        destination: "0x0000000000000000000000000000000000000001",
        amount: "1",
      }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "usdSend",
      "--destination=0x0000000000000000000000000000000000000001",
      "--amount=1",
    ]);
    v.parse(UsdSendRequest, data);
  },
});
