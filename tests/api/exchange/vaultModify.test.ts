import { ApiRequestError } from "@nktkas/hyperliquid";
import { type VaultModifyParameters, VaultModifyRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const paramsSchema = valibotToJsonSchema(v.omit(v.object(VaultModifyRequest.entries.action.entries), ["type"]));

runTest({
  name: "vaultModify",
  codeTestFn: async (_t, exchClient) => {
    const params: VaultModifyParameters[] = [
      // allowDeposits=null | alwaysCloseOnWithdraw=null
      {
        vaultAddress: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
        allowDeposits: null,
        alwaysCloseOnWithdraw: null,
      },
      // allowDeposits=true | alwaysCloseOnWithdraw=true
      {
        vaultAddress: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
        allowDeposits: true,
        alwaysCloseOnWithdraw: true,
      },
      // allowDeposits=false | alwaysCloseOnWithdraw=false
      {
        vaultAddress: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
        allowDeposits: false,
        alwaysCloseOnWithdraw: false,
      },
      // allowDeposits=missing | alwaysCloseOnWithdraw=missing
      {
        vaultAddress: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
      },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.vaultModify(p);
        },
        ApiRequestError,
        "Only leader can perform this vault action",
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
});
