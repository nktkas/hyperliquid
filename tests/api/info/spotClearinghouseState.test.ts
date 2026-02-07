import * as v from "@valibot/valibot";
import { SpotClearinghouseStateRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/spotClearinghouseState.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "SpotClearinghouseStateResponse");

runTest({
  name: "spotClearinghouseState",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.spotClearinghouseState({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }), // balances.length > 0
      client.spotClearinghouseState({ user: "0x1defed46db35334232b9f5fd2e5c6180276fb99d" }), // evmEscrows.length > 0
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "spotClearinghouseState",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(SpotClearinghouseStateRequest, data);
  },
});
