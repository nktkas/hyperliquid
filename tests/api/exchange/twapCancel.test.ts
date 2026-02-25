import { type TwapCancelParameters, TwapCancelRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { createTWAP, runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/twapCancel.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "TwapCancelSuccessResponse");
const paramsSchema = valibotToJsonSchema(v.omit(v.object(TwapCancelRequest.entries.action.entries), ["type"]));

runTest({
  name: "twapCancel",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      (async () => {
        const twap = await createTWAP(exchClient);
        const params: TwapCancelParameters = { a: twap.a, t: twap.twapId };
        return { params, result: await exchClient.twapCancel(params) };
      })(),
    ]);

    schemaCoverage(paramsSchema, data.map((d) => d.params));
    schemaCoverage(responseSchema, data.map((d) => d.result));
  },
});
