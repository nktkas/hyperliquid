import * as v from "@valibot/valibot";
import { type MaxBuilderFeeParameters, MaxBuilderFeeRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/maxBuilderFee.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "MaxBuilderFeeResponse");
const paramsSchema = valibotToJsonSchema(v.omit(MaxBuilderFeeRequest, ["type"]));

runTest({
  name: "maxBuilderFee",
  codeTestFn: async (_t, client) => {
    const params: MaxBuilderFeeParameters[] = [
      {
        user: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
        builder: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
      },
    ];

    const data = await Promise.all(params.map((p) => client.maxBuilderFee(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "maxBuilderFee",
      "--user=0xe019d6167E7e324aEd003d94098496b6d986aB05",
      "--builder=0xe019d6167E7e324aEd003d94098496b6d986aB05",
    ]);
    v.parse(MaxBuilderFeeRequest, data);
  },
});
