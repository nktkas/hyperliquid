import * as v from "@valibot/valibot";
import { type BlockDetailsParameters, BlockDetailsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/blockDetails.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "BlockDetailsResponse");
const paramsSchema = valibotToJsonSchema(v.omit(BlockDetailsRequest, ["type"]));

runTest({
  name: "blockDetails",
  codeTestFn: async (_t, client) => {
    const params: BlockDetailsParameters[] = [
      { height: 300836507 },
    ];

    const data = await Promise.all(params.map((p) => client.blockDetails(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
