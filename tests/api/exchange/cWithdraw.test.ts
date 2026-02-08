import * as v from "@valibot/valibot";
import { type CWithdrawParameters, CWithdrawRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest, topUpSpot } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/cWithdraw.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "CWithdrawSuccessResponse");
const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(CWithdrawRequest.entries.action.entries), ["type", "signatureChainId", "hyperliquidChain", "nonce"]),
);

runTest({
  name: "cWithdraw",
  codeTestFn: async (_t, exchClient) => {
    await topUpSpot(exchClient, "HYPE", "0.00000001");
    await exchClient.cDeposit({ wei: 1 });

    const params: CWithdrawParameters[] = [
      { wei: 1 },
    ];

    const data = await Promise.all(params.map((p) => exchClient.cWithdraw(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "cWithdraw",
      "--wei=1",
    ]);
    v.parse(CWithdrawRequest, data);
  },
});
