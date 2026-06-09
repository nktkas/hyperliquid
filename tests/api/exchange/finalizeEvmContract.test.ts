import { ApiRequestError } from "@nktkas/hyperliquid";
import { type FinalizeEvmContractParameters, FinalizeEvmContractRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(FinalizeEvmContractRequest.entries.action.entries), ["type"]),
);

runTest({
  name: "finalizeEvmContract",
  codeTestFn: async (_t, exchClient) => {
    const params: FinalizeEvmContractParameters[] = [
      // input = { create: { nonce } }
      { token: 0, input: { create: { nonce: 0 } } },
      // input = "firstStorageSlot"
      { token: 0, input: "firstStorageSlot" },
      // input = "customStorageSlot"
      { token: 0, input: "customStorageSlot" },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.finalizeEvmContract(p);
        },
        ApiRequestError,
        "Error deploying spot: Pending EVM contract missing",
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
});
