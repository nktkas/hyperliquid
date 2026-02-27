import { type ApprovedBuildersParameters, ApprovedBuildersRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/approvedBuilders.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "ApprovedBuildersResponse");
const paramsSchema = valibotToJsonSchema(v.omit(ApprovedBuildersRequest, ["type"]));

runTest({
  name: "approvedBuilders",
  codeTestFn: async (_t, client) => {
    const params: ApprovedBuildersParameters[] = [
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, // non-empty array
      { user: "0x0000000000000000000000000000000000000001" }, // empty array
    ];

    const data = await Promise.all(params.map((p) => client.approvedBuilders(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
