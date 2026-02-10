import * as v from "@valibot/valibot";
import { type CancelByCloidParameters, CancelByCloidRequest } from "@nktkas/hyperliquid/api/exchange";
import { openOrder, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/cancelByCloid.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "CancelByCloidSuccessResponse");
const paramsSchema = valibotToJsonSchema(v.omit(v.object(CancelByCloidRequest.entries.action.entries), ["type"]));

runTest({
  name: "cancelByCloid",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      (async () => {
        const order = await openOrder(exchClient, "limit");
        const params: CancelByCloidParameters = { cancels: [{ asset: order.a, cloid: order.cloid }] };
        return { params, result: await exchClient.cancelByCloid(params) };
      })(),
    ]);

    schemaCoverage(paramsSchema, data.map((d) => d.params));
    schemaCoverage(responseSchema, data.map((d) => d.result));
  },
});
