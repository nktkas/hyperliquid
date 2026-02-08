import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { type SubAccountModifyParameters, SubAccountModifyRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const paramsSchema = valibotToJsonSchema(v.omit(v.object(SubAccountModifyRequest.entries.action.entries), ["type"]));

runTest({
  name: "subAccountModify",
  codeTestFn: async (_t, exchClient) => {
    const params: SubAccountModifyParameters[] = [
      {
        subAccountUser: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
        name: String(Date.now()),
      },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.subAccountModify(p);
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
      "subAccountModify",
      "--subAccountUser=0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
      "--name=test",
    ]);
    v.parse(SubAccountModifyRequest, data);
  },
});
