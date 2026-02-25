import {
  type ActiveAssetCtxEvent,
  type ActiveAssetCtxParameters,
  ActiveAssetCtxRequest,
} from "@nktkas/hyperliquid/api/subscription";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/activeAssetCtx.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "ActiveAssetCtxEvent");
const paramsSchema = valibotToJsonSchema(v.omit(ActiveAssetCtxRequest, ["type"]));

runTest({
  name: "activeAssetCtx",
  mode: "api",
  fn: async (_t, client) => {
    const params: ActiveAssetCtxParameters[] = [
      { coin: "ETH" },
      { coin: "AXL" },
    ];

    const data = await collectEventsOverTime<ActiveAssetCtxEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.activeAssetCtx(p, cb)));
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
