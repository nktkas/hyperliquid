import * as v from "@valibot/valibot";
import { UserToMultiSigSignersRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userToMultiSigSigners.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "UserToMultiSigSignersResponse");

runTest({
  name: "userToMultiSigSigners",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userToMultiSigSigners({ user: "0x7A8b673a176a430b80cfCDfdFB6b10ED55010Ebb" }), // { ... }
      client.userToMultiSigSigners({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }), // null
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userToMultiSigSigners",
      "--user=0x7A8b673a176a430b80cfCDfdFB6b10ED55010Ebb",
    ]);
    v.parse(UserToMultiSigSignersRequest, data);
  },
});
