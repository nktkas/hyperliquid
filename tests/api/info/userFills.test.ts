import * as v from "@valibot/valibot";
import { UserFillsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userFills.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "UserFillsResponse");

runTest({
  name: "userFills",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userFills({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
      client.userFills({ user: "0x8172cc20bc3a55dcd07c75dd37ac0c2534de3b84" }),
    ]);
    schemaCoverage(typeSchema, data, [
      "#/items/properties/twapId/defined",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userFills",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(UserFillsRequest, data);
  },
});
