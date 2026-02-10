import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { type SubAccountSpotTransferParameters, SubAccountSpotTransferRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(SubAccountSpotTransferRequest.entries.action.entries), ["type"]),
);

runTest({
  name: "subAccountSpotTransfer",
  codeTestFn: async (_t, exchClient) => {
    const params: SubAccountSpotTransferParameters[] = [
      // isDeposit=true
      {
        subAccountUser: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
        isDeposit: true,
        token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
        amount: "1",
      },
      // isDeposit=false
      {
        subAccountUser: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
        isDeposit: false,
        token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
        amount: "1",
      },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.subAccountSpotTransfer(p);
        },
        ApiRequestError,
        "Invalid sub-account transfer from",
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
});
