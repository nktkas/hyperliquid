import { parser, ReferralRequest, ReferralResponse } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "referral",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.referral({ user: "0x0000000000000000000000000000000000000001" }), // referredBy = null
      client.referral({ user: "0x091288cd1e81e065d1541ec73dd0dfdde2f529fa" }), // referredBy = hex
      client.referral({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }), // referrerState.stage = ready
      client.referral({ user: "0x97c36726668f490fa17eb2957a92D39116f171fE" }), // referrerState.stage = needToCreateCode
      client.referral({ user: "0x0000000000000000000000000000000000000001" }), // referrerState.stage = needToTrade
    ]);
    schemaCoverage(ReferralResponse, data, {
      ignoreEmptyArray: ["#/properties/rewardHistory"],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "referral", "--user", "0x0000000000000000000000000000000000000001"]);
    parser(ReferralRequest)(JSON.parse(data));
  },
});
