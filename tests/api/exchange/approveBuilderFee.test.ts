import { type ApproveBuilderFeeParameters, ApproveBuilderFeeRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/approveBuilderFee.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "ApproveBuilderFeeSuccessResponse");
const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(ApproveBuilderFeeRequest.entries.action.entries), [
    "type",
    "signatureChainId",
    "hyperliquidChain",
    "nonce",
  ]),
);

runTest({
  name: "approveBuilderFee",
  codeTestFn: async (_t, exchClient) => {
    const params: ApproveBuilderFeeParameters[] = [
      {
        maxFeeRate: "0.001%",
        builder: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
      },
    ];

    const data = await Promise.all(params.map((p) => exchClient.approveBuilderFee(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
