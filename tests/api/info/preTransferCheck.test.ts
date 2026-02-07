import * as v from "@valibot/valibot";
import { PreTransferCheckRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/preTransferCheck.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "PreTransferCheckResponse");

runTest({
  name: "preTransferCheck",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.preTransferCheck({
        user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
        source: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
      }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "preTransferCheck",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
      "--source=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(PreTransferCheckRequest, data);
  },
});
