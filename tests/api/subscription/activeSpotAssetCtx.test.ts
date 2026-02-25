import {
  type ActiveSpotAssetCtxEvent,
  type ActiveSpotAssetCtxParameters,
  ActiveSpotAssetCtxRequest,
} from "@nktkas/hyperliquid/api/subscription";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/activeSpotAssetCtx.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "ActiveSpotAssetCtxEvent");
const paramsSchema = valibotToJsonSchema(v.omit(ActiveSpotAssetCtxRequest, ["type"]));

runTest({
  name: "activeSpotAssetCtx",
  mode: "api",
  fn: async (_t, client) => {
    const params: ActiveSpotAssetCtxParameters[] = [
      { coin: "@107" },
      { coin: "@27" },
    ];

    const data = await collectEventsOverTime<ActiveSpotAssetCtxEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.activeSpotAssetCtx(p, cb)));
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
