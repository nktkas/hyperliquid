import * as v from "@valibot/valibot";
import { type SpotUserParameters, SpotUserRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/spotUser.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "SpotUserSuccessResponse");
const paramsSchema = valibotToJsonSchema(v.omit(v.object(SpotUserRequest.entries.action.entries), ["type"]));

runTest({
  name: "spotUser",
  codeTestFn: async (_t, exchClient) => {
    const params: SpotUserParameters[] = [
      // optOut=true
      { toggleSpotDusting: { optOut: true } },
      // optOut=false
      { toggleSpotDusting: { optOut: false } },
    ];

    const data = await Promise.all(params.map((p) => exchClient.spotUser(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
