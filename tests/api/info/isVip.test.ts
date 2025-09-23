import { IsVipRequest, IsVipResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "isVip",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.isVip({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(IsVipResponse, data, {
      ignoreNullTypes: ["#"],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "isVip", "--user", "0x563C175E6f11582f65D6d9E360A618699DEe14a9"]);
    parser(IsVipRequest)(JSON.parse(data));
  },
});
