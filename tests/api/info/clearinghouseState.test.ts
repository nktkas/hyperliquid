import * as v from "@valibot/valibot";
import { ClearinghouseStateRequest, ClearinghouseStateResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

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
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(ClearinghouseStateRequest, data);
  },
});
