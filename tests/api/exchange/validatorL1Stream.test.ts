import { ApiRequestError } from "@nktkas/hyperliquid";
import { type ValidatorL1StreamParameters, ValidatorL1StreamRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const paramsSchema = valibotToJsonSchema(v.omit(v.object(ValidatorL1StreamRequest.entries.action.entries), ["type"]));

runTest({
  name: "validatorL1Stream",
  codeTestFn: async (_t, exchClient) => {
    const params: ValidatorL1StreamParameters[] = [
      { riskFreeRate: "0.05" },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.validatorL1Stream(p);
        },
        ApiRequestError,
        "Unknown validator",
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
});
