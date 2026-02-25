import { ApiRequestError } from "@nktkas/hyperliquid";
import { type CreateSubAccountParameters, CreateSubAccountRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const paramsSchema = valibotToJsonSchema(v.omit(v.object(CreateSubAccountRequest.entries.action.entries), ["type"]));

runTest({
  name: "createSubAccount",
  codeTestFn: async (_t, exchClient) => {
    const params: CreateSubAccountParameters[] = [
      { name: String(Date.now()) },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.createSubAccount(p);
        },
        ApiRequestError,
        "Cannot create sub-accounts until enough volume traded",
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
});
