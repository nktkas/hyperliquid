import * as v from "@valibot/valibot";
import { type UsdClassTransferParameters, UsdClassTransferRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/usdClassTransfer.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UsdClassTransferSuccessResponse");
const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(UsdClassTransferRequest.entries.action.entries), [
    "type",
    "signatureChainId",
    "hyperliquidChain",
    "nonce",
  ]),
);

runTest({
  name: "usdClassTransfer",
  codeTestFn: async (_t, exchClient) => {
    // toPerp=false (Perp → Spot)
    const perpToSpot = await (async () => {
      const params: UsdClassTransferParameters = { amount: "1", toPerp: false };
      return { params, result: await exchClient.usdClassTransfer(params) };
    })();

    // toPerp=true (Spot → Perp)
    const spotToPerp = await (async () => {
      const params: UsdClassTransferParameters = { amount: "1", toPerp: true };
      return { params, result: await exchClient.usdClassTransfer(params) };
    })();

    const data = [perpToSpot, spotToPerp];

    schemaCoverage(paramsSchema, data.map((d) => d.params));
    schemaCoverage(responseSchema, data.map((d) => d.result));
  },
});
