import { type CDepositParameters, CDepositRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest, topUpSpot } from "./_t.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/cDeposit.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "CDepositSuccessResponse");
const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(CDepositRequest.entries.action.entries), ["type", "signatureChainId", "hyperliquidChain", "nonce"]),
);

runTest({
  name: "cDeposit",
  codeTestFn: async (_t, exchClient) => {
    await topUpSpot(exchClient, "HYPE", "0.00000001");

    const params: CDepositParameters[] = [
      { wei: 1 },
    ];

    const data = await Promise.all(params.map((p) => exchClient.cDeposit(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
