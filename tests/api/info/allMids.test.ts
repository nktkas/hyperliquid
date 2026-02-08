import * as v from "@valibot/valibot";
import { type AllMidsParameters, AllMidsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/allMids.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "AllMidsResponse");
const paramsSchema = valibotToJsonSchema(v.omit(AllMidsRequest, ["type"]));

runTest({
  name: "allMids",
  codeTestFn: async (_t, client) => {
    const params: AllMidsParameters[] = [
      {},
      { dex: "gato" },
    ];

    const data = await Promise.all(params.map((p) => client.allMids(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "allMids",
    ]);
    v.parse(AllMidsRequest, data);
  },
});
