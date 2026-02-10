import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { type ScheduleCancelParameters, ScheduleCancelRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const paramsSchema = valibotToJsonSchema(v.omit(v.object(ScheduleCancelRequest.entries.action.entries), ["type"]));

runTest({
  name: "scheduleCancel",
  codeTestFn: async (_t, exchClient) => {
    const params: ScheduleCancelParameters[] = [
      // time=defined
      { time: Date.now() + 30000 },
      // time=missing
      {},
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.scheduleCancel(p);
        },
        ApiRequestError,
        "Cannot set scheduled cancel time until enough volume traded",
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
});
