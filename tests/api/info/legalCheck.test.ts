import { type LegalCheckParameters, LegalCheckRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/legalCheck.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "LegalCheckResponse");
const paramsSchema = valibotToJsonSchema(v.omit(LegalCheckRequest, ["type"]));

runTest({
  name: "legalCheck",
  codeTestFn: async (_t, client) => {
    const params: LegalCheckParameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
    ];

    const data = await Promise.all(params.map((p) => client.legalCheck(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
