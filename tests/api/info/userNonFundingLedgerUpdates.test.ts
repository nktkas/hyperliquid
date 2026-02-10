import * as v from "@valibot/valibot";
import {
  type UserNonFundingLedgerUpdatesParameters,
  UserNonFundingLedgerUpdatesRequest,
} from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userNonFundingLedgerUpdates.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserNonFundingLedgerUpdatesResponse");
const paramsSchema = valibotToJsonSchema(v.omit(UserNonFundingLedgerUpdatesRequest, ["type"]));

runTest({
  name: "userNonFundingLedgerUpdates",
  codeTestFn: async (_t, client) => {
    const now = Date.now();
    const fiveYears = 1000 * 60 * 60 * 24 * 365 * 5;
    const params: UserNonFundingLedgerUpdatesParameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, // startTime absent, endTime absent
      { user: "0xc65008a70F511ae0407D26022ff1516422AceA94" }, // startTime absent, endTime absent
      { user: "0x4993a3a6b03414ae9cf02a545db7a04af7c9f291" }, // startTime absent, endTime absent
      { user: "0x11fe8a3dbc48b7b8138cdc9538015e2b928b86e8" }, // startTime absent, endTime absent
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", startTime: now - fiveYears }, // startTime present
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", startTime: now - fiveYears, endTime: now }, // endTime present
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", startTime: now - fiveYears, endTime: null }, // endTime null
    ];

    const data = await Promise.all(params.map((p) => client.userNonFundingLedgerUpdates(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/items/properties/delta/anyOf/3/properties/leverageType/enum/0",
    ]);
  },
});
