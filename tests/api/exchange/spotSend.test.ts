import * as v from "@valibot/valibot";
import { SpotSendRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest, topUpSpot } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/spotSend.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "SpotSendSuccessResponse");

runTest({
  name: "spotSend",
  codeTestFn: async (_t, exchClient) => {
    // ========== Prepare ==========

    await topUpSpot(exchClient, "USDC", "2");

    // ========== Test ==========

    const data = await Promise.all([
      exchClient.spotSend({
        destination: "0x0000000000000000000000000000000000000001",
        token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
        amount: "1",
      }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "spotSend",
      "--destination=0x0000000000000000000000000000000000000001",
      "--token=USDC:0xeb62eee3685fc4c43992febcd9e75443",
      "--amount=1",
    ]);
    v.parse(SpotSendRequest, data);
  },
});
