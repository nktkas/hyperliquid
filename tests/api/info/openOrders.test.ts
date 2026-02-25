import { type OpenOrdersParameters, OpenOrdersRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/openOrders.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "OpenOrdersResponse");
const paramsSchema = valibotToJsonSchema(v.omit(OpenOrdersRequest, ["type"]));

runTest({
  name: "openOrders",
  codeTestFn: async (_t, client) => {
    const params: OpenOrdersParameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", dex: "gato" },
    ];

    const data = await Promise.all(params.map((p) => client.openOrders(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/items/properties/cloid/present",
    ]);
  },
});
