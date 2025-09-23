import { parser, TwapHistoryRequest, TwapHistoryResponse } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "twapHistory",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.twapHistory({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(TwapHistoryResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "twapHistory", "--user", "0x563C175E6f11582f65D6d9E360A618699DEe14a9"]);
    parser(TwapHistoryRequest)(JSON.parse(data));
  },
});
