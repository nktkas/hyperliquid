import { ApiRequestError } from "@nktkas/hyperliquid";
import { type AuthorizeAqav2RoleParameters, AuthorizeAqav2RoleRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(AuthorizeAqav2RoleRequest.entries.action.entries), ["type"]),
);

runTest({
  name: "authorizeAqav2Role",
  codeTestFn: async (_t, exchClient) => {
    const params: AuthorizeAqav2RoleParameters[] = [
      // role=technical
      { token: 0, role: "technical" },
      // role=treasury
      { token: 0, role: "treasury" },
    ];

    await assertRejects(
      async () => {
        await exchClient.authorizeAqav2Role(params[0]);
      },
      ApiRequestError,
      "Insufficient stake",
    );
    await assertRejects(
      async () => {
        await exchClient.authorizeAqav2Role(params[1]);
      },
      ApiRequestError,
      "Insufficient stake",
    );

    schemaCoverage(paramsSchema, params);
  },
});
