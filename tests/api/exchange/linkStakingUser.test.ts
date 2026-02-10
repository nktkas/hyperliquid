import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { type LinkStakingUserParameters, LinkStakingUserRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(LinkStakingUserRequest.entries.action.entries), [
    "type",
    "signatureChainId",
    "hyperliquidChain",
    "nonce",
  ]),
);

runTest({
  name: "linkStakingUser",
  codeTestFn: async (_t, exchClient) => {
    const params: LinkStakingUserParameters[] = [
      // isFinalize=false
      { user: "0x0000000000000000000000000000000000000001", isFinalize: false },
      // isFinalize=true
      { user: "0x0000000000000000000000000000000000000001", isFinalize: true },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.linkStakingUser(p);
        },
        ApiRequestError,
        "Staking link error",
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
});
