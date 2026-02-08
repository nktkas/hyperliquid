import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { type RegisterReferrerParameters, RegisterReferrerRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const paramsSchema = valibotToJsonSchema(v.omit(v.object(RegisterReferrerRequest.entries.action.entries), ["type"]));

runTest({
  name: "registerReferrer",
  codeTestFn: async (_t, exchClient) => {
    const params: RegisterReferrerParameters[] = [
      { code: "TEST" },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.registerReferrer(p);
        },
        ApiRequestError,
        "Cannot generate referral code until enough volume traded",
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "registerReferrer",
      "--code=TESST",
    ]);
    v.parse(RegisterReferrerRequest, data);
  },
});
