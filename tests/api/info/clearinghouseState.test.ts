import { ClearinghouseStateRequest, ClearinghouseStateResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "clearinghouseState",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.clearinghouseState({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(ClearinghouseStateResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "clearinghouseState",
      "--user",
      "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    parser(ClearinghouseStateRequest)(JSON.parse(data));
  },
});
