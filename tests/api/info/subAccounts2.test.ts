import * as v from "@valibot/valibot";
import { SubAccounts2Request } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/subAccounts2.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "SubAccounts2Response");

runTest({
  name: "subAccounts2",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.subAccounts2({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }), // length > 0
      client.subAccounts2({ user: "0x0000000000000000000000000000000000000001" }), // null
    ]);
    schemaCoverage(typeSchema, data, [
      "#/anyOf/0/items/properties/dexToClearinghouseState/items/items/1/properties/assetPositions/items/properties/position/properties/leverage/anyOf/0",
      "#/anyOf/0/items/properties/dexToClearinghouseState/items/items/1/properties/assetPositions/items/properties/position/properties/liquidationPx/defined",
      "#/anyOf/0/items/properties/spotState/properties/evmEscrows/present",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "subAccounts2",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(SubAccounts2Request, data);
  },
});
