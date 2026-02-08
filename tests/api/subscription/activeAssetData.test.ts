import * as v from "@valibot/valibot";
import {
  type ActiveAssetDataEvent,
  type ActiveAssetDataParameters,
  ActiveAssetDataRequest,
} from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/activeAssetData.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "ActiveAssetDataEvent");
const paramsSchema = valibotToJsonSchema(v.omit(ActiveAssetDataRequest, ["type"]));

runTest({
  name: "activeAssetData",
  mode: "api",
  fn: async (_t, client) => {
    const params: ActiveAssetDataParameters[] = [
      { coin: "GALA", user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
      { coin: "NEAR", user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
    ];

    const data = await collectEventsOverTime<ActiveAssetDataEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.activeAssetData(p, cb)));
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
