import { ApiRequestError } from "@nktkas/hyperliquid";
import { type UserDexAbstractionParameters, UserDexAbstractionRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(UserDexAbstractionRequest.entries.action.entries), [
    "type",
    "signatureChainId",
    "hyperliquidChain",
    "nonce",
  ]),
);

runTest({
  name: "userDexAbstraction",
  codeTestFn: async (_t, exchClient) => {
    const params: UserDexAbstractionParameters[] = [
      {
        user: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
        enabled: true,
      },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.userDexAbstraction(p);
        },
        ApiRequestError,
        "Sub-account 0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1 is not registered to",
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
});
