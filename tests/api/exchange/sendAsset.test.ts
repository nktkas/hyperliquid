import * as v from "@valibot/valibot";
import { SendAssetRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/sendAsset.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "SendAssetSuccessResponse");

runTest({
  name: "sendAsset",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.sendAsset({
        destination: "0x0000000000000000000000000000000000000001",
        sourceDex: "",
        destinationDex: "test",
        token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
        amount: "1",
        fromSubAccount: "",
      }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "sendAsset",
      "--destination=0x0000000000000000000000000000000000000001",
      "--sourceDex=",
      "--destinationDex=test",
      "--token=USDC:0xeb62eee3685fc4c43992febcd9e75443",
      "--amount=1",
    ]);
    v.parse(SendAssetRequest, data);
  },
});
