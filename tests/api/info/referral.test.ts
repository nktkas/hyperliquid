import * as v from "@valibot/valibot";
import { ReferralRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/referral.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "ReferralResponse");

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
    schemaCoverage(typeSchema, data, [
      "#/properties/rewardHistory/array",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "referral",
      "--user=0x0000000000000000000000000000000000000001",
    ]);
    v.parse(ReferralRequest, data);
  },
});
