import * as v from "@valibot/valibot";
import { type SendAssetParameters, SendAssetRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/sendAsset.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "SendAssetSuccessResponse");
const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(SendAssetRequest.entries.action.entries), ["type", "signatureChainId", "hyperliquidChain", "nonce"]),
);

runTest({
  name: "sendAsset",
  codeTestFn: async (_t, exchClient) => {
    const params: SendAssetParameters[] = [
      // fromSubAccount=""
      {
        destination: "0x0000000000000000000000000000000000000001",
        sourceDex: "",
        destinationDex: "test",
        token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
        amount: "0.01",
        fromSubAccount: "",
      },
      // fromSubAccount=missing
      {
        destination: "0x0000000000000000000000000000000000000001",
        sourceDex: "",
        destinationDex: "test",
        token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
        amount: "0.01",
      },
    ];

    const data = await Promise.all(params.map((p) => exchClient.sendAsset(p)));

    schemaCoverage(paramsSchema, params, [
      "#/properties/fromSubAccount/anyOf/1", // Address  requires registered sub-account
    ]);
    schemaCoverage(responseSchema, data);
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
