import { type SendToEvmWithDataParameters, SendToEvmWithDataRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest, topUpSpot } from "./_t.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/sendToEvmWithData.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "SendToEvmWithDataSuccessResponse");
const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(SendToEvmWithDataRequest.entries.action.entries), [
    "type",
    "signatureChainId",
    "hyperliquidChain",
    "nonce",
  ]),
);

runTest({
  name: "sendToEvmWithData",
  skipMultiSig: true, // API does not support multi-sig for this action (maybe)
  codeTestFn: async (_t, exchClient) => {
    await topUpSpot(exchClient, "USDC", "2");

    const params: SendToEvmWithDataParameters[] = [
      {
        token: "USDC",
        amount: "1",
        sourceDex: "spot",
        destinationRecipient: "0x0000000000000000000000000000000000000001",
        addressEncoding: "hex",
        destinationChainId: 998,
        gasLimit: 200000,
        data: "0x",
      },
    ];

    const data = await Promise.all(params.map((p) => exchClient.sendToEvmWithData(p)));

    schemaCoverage(paramsSchema, params, [
      "#/properties/addressEncoding/enum/1", // "base58" — only testing "hex"
    ]);
    schemaCoverage(responseSchema, data);
  },
});
