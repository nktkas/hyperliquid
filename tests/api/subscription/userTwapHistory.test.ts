import {
  type UserTwapHistoryEvent,
  type UserTwapHistoryParameters,
  UserTwapHistoryRequest,
} from "@nktkas/hyperliquid/api/subscription";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/userTwapHistory.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserTwapHistoryEvent");
const paramsSchema = valibotToJsonSchema(v.omit(UserTwapHistoryRequest, ["type"]));

runTest({
  name: "userTwapHistory",
  mode: "api",
  isTestnet: false,
  fn: async (_t, client) => {
    const params: UserTwapHistoryParameters[] = [
      { user: "0x03ce7863a2b62f4e227fd98605b79beb32618c76" }, // trigger.above: true
      { user: "0x0132157369b0d073dd99011da1777920a025fd77" }, // trigger.above: false
      { user: "0x051748895c6ed4fab50828bebe8e62e665134d23" }, // "stopped"
      { user: "0x06d5af06a3a7d29909e1cdc7a9deded2fb14ab57" }, // "error"
    ];

    const data = await collectEventsOverTime<UserTwapHistoryEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.userTwapHistory(p, cb)));
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/properties/isSnapshot/missing",
      "#/properties/history/items/properties/twapId/missing",
    ]);
  },
});
