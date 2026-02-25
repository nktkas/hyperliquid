import { type AssetCtxsEvent, type AssetCtxsParameters, AssetCtxsRequest } from "@nktkas/hyperliquid/api/subscription";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/assetCtxs.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "AssetCtxsEvent");
const paramsSchema = valibotToJsonSchema(v.omit(AssetCtxsRequest, ["type"]));

runTest({
  name: "assetCtxs",
  mode: "api",
  fn: async (_t, client) => {
    const params: AssetCtxsParameters[] = [
      {},
      { dex: "unit" },
    ];

    const data = await collectEventsOverTime<AssetCtxsEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.assetCtxs(p, cb)));
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
