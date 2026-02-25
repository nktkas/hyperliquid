import { type SpotSendParameters, SpotSendRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest, topUpSpot } from "./_t.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/spotSend.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "SpotSendSuccessResponse");
const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(SpotSendRequest.entries.action.entries), ["type", "signatureChainId", "hyperliquidChain", "time"]),
);

runTest({
  name: "spotSend",
  codeTestFn: async (_t, exchClient) => {
    await topUpSpot(exchClient, "USDC", "2");

    const params: SpotSendParameters[] = [
      {
        destination: "0x0000000000000000000000000000000000000001",
        token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
        amount: "1",
      },
    ];

    const data = await Promise.all(params.map((p) => exchClient.spotSend(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
