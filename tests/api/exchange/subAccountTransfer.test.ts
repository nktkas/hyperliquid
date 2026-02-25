import { ApiRequestError } from "@nktkas/hyperliquid";
import { type SubAccountTransferParameters, SubAccountTransferRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const paramsSchema = valibotToJsonSchema(v.omit(v.object(SubAccountTransferRequest.entries.action.entries), ["type"]));

runTest({
  name: "subAccountTransfer",
  codeTestFn: async (_t, exchClient) => {
    const params: SubAccountTransferParameters[] = [
      // isDeposit=true
      { subAccountUser: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1", isDeposit: true, usd: 1 },
      // isDeposit=false
      { subAccountUser: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1", isDeposit: false, usd: 1 },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.subAccountTransfer(p);
        },
        ApiRequestError,
        "Invalid sub-account transfer from",
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
});
