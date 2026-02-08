import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { type VaultTransferParameters, VaultTransferRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const paramsSchema = valibotToJsonSchema(v.omit(v.object(VaultTransferRequest.entries.action.entries), ["type"]));

runTest({
  name: "vaultTransfer",
  codeTestFn: async (_t, exchClient) => {
    const params: VaultTransferParameters[] = [
      // isDeposit=true
      {
        vaultAddress: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
        isDeposit: true,
        usd: 5 * 1e6,
      },
      // isDeposit=false
      {
        vaultAddress: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
        isDeposit: false,
        usd: 5 * 1e6,
      },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.vaultTransfer(p);
        },
        ApiRequestError,
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "vaultTransfer",
      "--vaultAddress=0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
      "--isDeposit=false",
      "--usd=5000000",
    ]);
    v.parse(VaultTransferRequest, data);
  },
});
