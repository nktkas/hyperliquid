import * as v from "@valibot/valibot";
import { SubAccountsRequest, SubAccountsResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "subAccounts",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.subAccounts({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }), // length > 0
      client.subAccounts({ user: "0x0000000000000000000000000000000000000001" }), // null
    ]);
    schemaCoverage(SubAccountsResponse, data, [
      "#/wrapped/items/properties/clearinghouseState/properties/assetPositions/items/properties/position/properties/leverage/variant/0",
      "#/wrapped/items/properties/clearinghouseState/properties/assetPositions/items/properties/position/properties/liquidationPx/defined",
      "#/wrapped/items/properties/spotState/properties/evmEscrows/defined",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "subAccounts",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(SubAccountsRequest, data);
  },
});
