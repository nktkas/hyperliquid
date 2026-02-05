import { UserEventsEvent } from "@nktkas/hyperliquid/api/subscription";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { collectEventsOverTime, createTWAP, runTestWithExchange } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTestWithExchange({
  name: "userEvents",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<UserEventsEvent>(async (cb) => {
      const user = await getWalletAddress(
        "multiSigUser" in client.exch.config_ ? client.exch.config_.signers[0] : client.exch.config_.wallet,
      );
      await client.subs.userEvents({ user }, cb);
      await createTWAP(client.exch);
    }, 10_000);
    schemaCoverage(UserEventsEvent, data, [
      "#/union/0",
      "#/union/1",
      "#/union/2",
      "#/union/3",
      "#/union/4/properties/twapHistory/items/properties/state/properties/side/picklist/1",
      "#/union/4/properties/twapHistory/items/properties/status/variant/0/properties/status/picklist/0",
      "#/union/4/properties/twapHistory/items/properties/status/variant/0/properties/status/picklist/2",
      "#/union/4/properties/twapHistory/items/properties/status/variant/1",
      "#/union/4/properties/twapHistory/items/properties/twapId/undefined",
      "#/union/5/properties/twapSliceFills/items/properties/fill/properties/side/picklist/1",
      "#/union/5/properties/twapSliceFills/items/properties/fill/properties/builderFee/defined",
      "#/union/5/properties/twapSliceFills/items/properties/fill/properties/twapId/defined",
    ]);
  },
});
