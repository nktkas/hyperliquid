import * as v from "@valibot/valibot";
import { UserDexAbstractionRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userDexAbstraction.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "UserDexAbstractionResponse");

runTest({
  name: "userDexAbstraction",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userDexAbstraction({ user: "0x0000000000000000000000000000000000000001" }), // null
      client.userDexAbstraction({ user: "0x187e15e124b8297a01c355b6a87ae74dd4c0069f" }), // boolean
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userDexAbstraction",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(UserDexAbstractionRequest, data);
  },
});
