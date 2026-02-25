import { ApiRequestError } from "@nktkas/hyperliquid";
import { type CSignerActionParameters, CSignerActionRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const paramsSchema = valibotToJsonSchema(
  v.union(
    CSignerActionRequest.entries.action.options.map((option) => v.omit(option, ["type"])),
  ),
);

runTest({
  name: "cSignerAction",
  codeTestFn: async (_t, exchClient) => {
    const params: CSignerActionParameters[] = [
      { jailSelf: null },
      { unjailSelf: null },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.cSignerAction(p);
        },
        ApiRequestError,
        "Signer invalid or inactive for current epoch",
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
});
