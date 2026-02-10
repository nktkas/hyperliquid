import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { type VaultDistributeParameters, VaultDistributeRequest } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const paramsSchema = valibotToJsonSchema(v.omit(v.object(VaultDistributeRequest.entries.action.entries), ["type"]));

runTest({
  name: "vaultDistribute",
  codeTestFn: async (_t, exchClient) => {
    const params: VaultDistributeParameters[] = [
      {
        vaultAddress: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
        usd: 1 * 1e6,
      },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.vaultDistribute(p);
        },
        ApiRequestError,
        "Only leader can perform this vault action",
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
});
