import * as v from "@valibot/valibot";
import { type TxDetailsParameters, TxDetailsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/txDetails.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "TxDetailsResponse");
const paramsSchema = valibotToJsonSchema(v.omit(TxDetailsRequest, ["type"]));

runTest({
  name: "txDetails",
  codeTestFn: async (_t, client) => {
    const params: TxDetailsParameters[] = [
      { hash: "0x8f1b2b67eda04ecbc7b00411ee669b010c0041e8f52c9ff5c3609d9ef7e66c71" }, // error = null
      { hash: "0x4de9f1f5d912c23d8fbb0411f01bfe0000eb9f3ccb3fec747cb96e75e8944b06" }, // error = string
    ];

    const data = await Promise.all(params.map((p) => client.txDetails(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "txDetails",
      "--hash=0x8f1b2b67eda04ecbc7b00411ee669b010c0041e8f52c9ff5c3609d9ef7e66c71",
    ]);
    v.parse(TxDetailsRequest, data);
  },
});
