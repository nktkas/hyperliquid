import * as v from "@valibot/valibot";
import {
  type ClearinghouseStateEvent,
  type ClearinghouseStateParameters,
  ClearinghouseStateRequest,
} from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/clearinghouseState.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "ClearinghouseStateEvent");
const paramsSchema = valibotToJsonSchema(v.omit(ClearinghouseStateRequest, ["type"]));

runTest({
  name: "clearinghouseState",
  mode: "api",
  fn: async (_t, client) => {
    const params: ClearinghouseStateParameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", dex: "" },
    ];

    const data = await collectEventsOverTime<ClearinghouseStateEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.clearinghouseState(p, cb)));
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
