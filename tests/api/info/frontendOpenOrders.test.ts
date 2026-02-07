import * as v from "@valibot/valibot";
import { FrontendOpenOrdersRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/frontendOpenOrders.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "FrontendOpenOrdersResponse");

runTest({
  name: "frontendOpenOrders",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.frontendOpenOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(typeSchema, data, [
      "#/items/properties/orderType/enum/0",
      "#/items/properties/orderType/enum/4",
      "#/items/properties/orderType/enum/5",
      "#/items/properties/tif/enum/1",
      "#/items/properties/tif/enum/3",
      "#/items/properties/tif/enum/4",
      "#/items/properties/tif/enum/5",
      "#/items/properties/cloid/defined",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "frontendOpenOrders",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(FrontendOpenOrdersRequest, data);
  },
});
