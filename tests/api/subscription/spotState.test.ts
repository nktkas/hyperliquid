import { type SpotStateEvent, type SpotStateParameters, SpotStateRequest } from "@nktkas/hyperliquid/api/subscription";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/spotState.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "SpotStateEvent");
const paramsSchema = valibotToJsonSchema(v.omit(SpotStateRequest, ["type"]));

runTest({
  name: "spotState",
  mode: "api",
  fn: async (_t, client) => {
    const params: SpotStateParameters[] = [
      { user: "0x0000000000000000000000000000000000000000" },
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" },
      { user: "0x1defed46db35334232b9f5fd2e5c6180276fb99d", ignorePortfolioMargin: true }, // evmEscrows.length > 0
    ];

    const data = await collectEventsOverTime<SpotStateEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.spotState(p, cb)));
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
