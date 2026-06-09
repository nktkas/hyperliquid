import { ApiRequestError } from "@nktkas/hyperliquid";
import { type UserOutcomeParameters, UserOutcomeRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const paramsSchema = valibotToJsonSchema(
  v.union(
    UserOutcomeRequest.entries.action.options.map((option) => v.omit(option, ["type"])),
  ),
);

runTest({
  name: "userOutcome",
  codeTestFn: async (_t, exchClient) => {
    const params: UserOutcomeParameters[] = [
      { splitOutcome: { outcome: 0, amount: "1" } },
      { mergeOutcome: { outcome: 0, amount: "1" } },
      { mergeOutcome: { outcome: 0, amount: null } },
      { mergeQuestion: { question: 0, amount: "1" } },
      { mergeQuestion: { question: 0, amount: null } },
      { negateOutcome: { question: 0, outcome: 0, amount: "1" } },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.userOutcome(p);
        },
        ApiRequestError,
        "Invalid ",
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
});
