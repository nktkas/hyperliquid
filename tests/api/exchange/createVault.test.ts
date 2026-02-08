import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { type CreateVaultParameters, CreateVaultRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const paramsSchema = valibotToJsonSchema(v.omit(v.object(CreateVaultRequest.entries.action.entries), ["type"]));

runTest({
  name: "createVault",
  codeTestFn: async (_t, exchClient) => {
    const params: CreateVaultParameters[] = [
      {
        name: "test",
        description: "1234567890",
        initialUsd: Number.MAX_SAFE_INTEGER,
        nonce: Date.now(),
      },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.createVault(p);
        },
        ApiRequestError,
        "Insufficient balance to create vault",
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "createVault",
      "--name=test",
      "--description=1234567890",
      "--initialUsd=100000000",
      "--nonce=1234567890",
    ]);
    v.parse(CreateVaultRequest, data);
  },
});
