// deno-lint-ignore-file no-import-prefix
import { WebData2Event } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest("webData2", "api", async (_t, client) => {
  const data = await Promise.all([
    deadline(
      new Promise<WebData2Event>((resolve) => {
        client.webData2({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, resolve);
      }),
      10_000,
    ),
  ]);
  schemaCoverage(WebData2Event, data, {
    ignoreEmptyArray: [
      "#/properties/leadingVaults",
      "#/properties/twapStates",
    ],
    ignoreBranches: {
      "#/properties/openOrders/items/properties/orderType": [0, 4, 5],
      "#/properties/openOrders/items/properties/tif/wrapped": [1, 3, 4],
    },
    ignoreUndefinedTypes: [
      "#/properties/spotState",
      "#/properties/perpsAtOpenInterestCap",
    ],
    ignoreDefinedTypes: [
      "#/properties/spotState/properties/evmEscrows",
      "#/properties/optOutOfSpotDusting",
      "#/properties/agentAddress",
      "#/properties/agentValidUntil",
    ],
  });
});
