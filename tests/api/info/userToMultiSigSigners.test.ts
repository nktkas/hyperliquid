import { parser, UserToMultiSigSignersRequest, UserToMultiSigSignersResponse } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "userToMultiSigSigners",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userToMultiSigSigners({ user: "0x7A8b673a176a430b80cfCDfdFB6b10ED55010Ebb" }), // { ... }
      client.userToMultiSigSigners({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }), // null
    ]);
    schemaCoverage(UserToMultiSigSignersResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userToMultiSigSigners",
      "--user",
      "0x7A8b673a176a430b80cfCDfdFB6b10ED55010Ebb",
    ]);
    parser(UserToMultiSigSignersRequest)(JSON.parse(data));
  },
});
