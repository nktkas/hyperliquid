import { type LeadingVaultsParameters, LeadingVaultsRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/leadingVaults.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "LeadingVaultsResponse");
const paramsSchema = valibotToJsonSchema(v.omit(LeadingVaultsRequest, ["type"]));

runTest({
  name: "leadingVaults",
  codeTestFn: async (_t, client) => {
    const params: LeadingVaultsParameters[] = [
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" },
    ];

    const data = await Promise.all(params.map((p) => client.leadingVaults(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
