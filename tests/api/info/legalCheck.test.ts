import * as v from "@valibot/valibot";
import { LegalCheckRequest, LegalCheckResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "legalCheck",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.legalCheck({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(LegalCheckResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "legalCheck",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(LegalCheckRequest, data);
  },
});
