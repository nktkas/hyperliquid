import { type CancelParameters, CancelRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { openOrder, runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/cancel.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "CancelSuccessResponse");
const paramsSchema = valibotToJsonSchema(v.omit(v.object(CancelRequest.entries.action.entries), ["type"]));

runTest({
  name: "cancel",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      (async () => {
        const order = await openOrder(exchClient, "limit");
        const params: CancelParameters = { cancels: [{ a: order.a, o: order.oid }] };
        return { params, result: await exchClient.cancel(params) };
      })(),
    ]);

    schemaCoverage(paramsSchema, data.map((d) => d.params));
    schemaCoverage(responseSchema, data.map((d) => d.result));
  },
});
