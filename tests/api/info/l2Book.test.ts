import * as v from "@valibot/valibot";
import { type L2BookParameters, L2BookRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/l2Book.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "L2BookResponse");
const paramsSchema = valibotToJsonSchema(v.omit(L2BookRequest, ["type"]));

runTest({
  name: "l2Book",
  codeTestFn: async (_t, client) => {
    const params: L2BookParameters[] = [
      { coin: "ETH" },
      { coin: "NONE/EXISTENT" }, // null response
      { coin: "ETH", nSigFigs: 2 },
      { coin: "ETH", nSigFigs: 3 },
      { coin: "ETH", nSigFigs: 4 },
      { coin: "ETH", nSigFigs: 5 },
      { coin: "ETH", nSigFigs: null },
      { coin: "ETH", nSigFigs: 5, mantissa: 2 },
      { coin: "ETH", nSigFigs: 5, mantissa: 5 },
      { coin: "ETH", nSigFigs: 5, mantissa: null },
    ];

    const data = await Promise.all(params.map((p) => client.l2Book(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
