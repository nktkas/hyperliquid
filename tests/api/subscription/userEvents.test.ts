import type { UserEventsEvent } from "@nktkas/hyperliquid/api/subscription";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { collectEventsOverTime, createTWAP, runTestWithExchange } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/userEvents.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "UserEventsEvent");

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
    schemaCoverage(typeSchema, data, [
      "#/anyOf/0",
      "#/anyOf/1",
      "#/anyOf/2",
      "#/anyOf/3",
      "#/anyOf/4/properties/twapHistory/items/properties/state/properties/side/enum/1",
      "#/anyOf/4/properties/twapHistory/items/properties/status/anyOf/0/properties/status/enum/0",
      "#/anyOf/4/properties/twapHistory/items/properties/status/anyOf/0/properties/status/enum/2",
      "#/anyOf/4/properties/twapHistory/items/properties/status/anyOf/1",
      "#/anyOf/4/properties/twapHistory/items/properties/twapId/missing",
      "#/anyOf/5/properties/twapSliceFills/items/properties/fill/properties/side/enum/1",
      "#/anyOf/5/properties/twapSliceFills/items/properties/fill/properties/builderFee/present",
      "#/anyOf/5/properties/twapSliceFills/items/properties/fill/properties/twapId/defined",
    ]);
  },
});
