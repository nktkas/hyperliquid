import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { type UserSetAbstractionParameters, UserSetAbstractionRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(UserSetAbstractionRequest.entries.action.entries), [
    "type",
    "signatureChainId",
    "hyperliquidChain",
    "nonce",
  ]),
);

runTest({
  name: "userSetAbstraction",
  codeTestFn: async (_t, exchClient) => {
    // FIXME: Multisig does not support this method.
    //        Unknown whether this is an SDK issue or a Hyperliquid limitation.
    if ("signers" in exchClient.config_) return;

    const params: UserSetAbstractionParameters[] = [
      { user: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1", abstraction: "dexAbstraction" },
      { user: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1", abstraction: "unifiedAccount" },
      { user: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1", abstraction: "portfolioMargin" },
      { user: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1", abstraction: "disabled" },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.userSetAbstraction(p);
        },
        ApiRequestError,
        "Sub-account 0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1 is not registered to",
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "userSetAbstraction",
      "--user=0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
      "--abstraction=dexAbstraction",
    ]);
    v.parse(UserSetAbstractionRequest, data);
  },
});
