import * as v from "@valibot/valibot";
import { ApproveBuilderFeeRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/approveBuilderFee.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "ApproveBuilderFeeSuccessResponse");

runTest({
  name: "approveBuilderFee",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.approveBuilderFee({
        maxFeeRate: "0.001%",
        builder: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
      }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "approveBuilderFee",
      "--maxFeeRate=0.001%",
      "--builder=0xe019d6167E7e324aEd003d94098496b6d986aB05",
    ]);
    v.parse(ApproveBuilderFeeRequest, data);
  },
});
