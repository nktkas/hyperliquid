import * as v from "@valibot/valibot";
import { type UsdSendParameters, UsdSendRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/usdSend.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UsdSendSuccessResponse");
const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(UsdSendRequest.entries.action.entries), ["type", "signatureChainId", "hyperliquidChain", "time"]),
);

runTest({
  name: "usdSend",
  codeTestFn: async (_t, exchClient) => {
    const params: UsdSendParameters[] = [
      { destination: "0x0000000000000000000000000000000000000001", amount: "1" },
    ];

    const data = await Promise.all(params.map((p) => exchClient.usdSend(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
