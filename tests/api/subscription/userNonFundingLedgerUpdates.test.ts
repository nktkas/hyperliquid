import type { UserNonFundingLedgerUpdatesEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile =
  new URL("../../../src/api/subscription/_methods/userNonFundingLedgerUpdates.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "UserNonFundingLedgerUpdatesEvent");

runTest({
  name: "userNonFundingLedgerUpdates",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<UserNonFundingLedgerUpdatesEvent>(async (cb) => {
      await client.userNonFundingLedgerUpdates({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
      await client.userNonFundingLedgerUpdates({ user: "0xc65008a70F511ae0407D26022ff1516422AceA94" }, cb);
      await client.userNonFundingLedgerUpdates({ user: "0x4993a3a6b03414ae9cf02a545db7a04af7c9f291" }, cb);
      await client.userNonFundingLedgerUpdates({ user: "0x11fe8a3dbc48b7b8138cdc9538015e2b928b86e8" }, cb);
    }, 10_000);
    schemaCoverage(typeSchema, data, [
      "#/properties/nonFundingLedgerUpdates/items/properties/delta/anyOf/1",
      "#/properties/nonFundingLedgerUpdates/items/properties/delta/anyOf/3",
      "#/properties/nonFundingLedgerUpdates/items/properties/delta/anyOf/4",
      "#/properties/nonFundingLedgerUpdates/items/properties/delta/anyOf/5/properties/nonce/null",
      "#/properties/nonFundingLedgerUpdates/items/properties/delta/anyOf/6",
      "#/properties/nonFundingLedgerUpdates/items/properties/delta/anyOf/7",
      "#/properties/nonFundingLedgerUpdates/items/properties/delta/anyOf/8",
      "#/properties/nonFundingLedgerUpdates/items/properties/delta/anyOf/10",
      "#/properties/nonFundingLedgerUpdates/items/properties/delta/anyOf/11",
      "#/properties/nonFundingLedgerUpdates/items/properties/delta/anyOf/14",
      "#/properties/isSnapshot/missing",
    ]);
  },
});
