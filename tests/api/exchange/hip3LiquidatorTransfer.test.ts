import { ApiRequestError } from "@nktkas/hyperliquid";
import { type Hip3LiquidatorTransferParameters, Hip3LiquidatorTransferRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(Hip3LiquidatorTransferRequest.entries.action.entries), ["type"]),
);

runTest({
  name: "hip3LiquidatorTransfer",
  codeTestFn: async (_t, exchClient) => {
    const params: Hip3LiquidatorTransferParameters[] = [
      // isDeposit=true
      { dex: "test", ntl: 1_000_000_000, isDeposit: true },
      // isDeposit=false
      { dex: "test", ntl: 1_000_000_000, isDeposit: false },
    ];

    await assertRejects(
      async () => {
        await exchClient.hip3LiquidatorTransfer(params[0]);
      },
      ApiRequestError,
      "Insufficient funds available to deposit.",
    );
    await assertRejects(
      async () => {
        await exchClient.hip3LiquidatorTransfer(params[1]);
      },
      ApiRequestError,
      "Insufficient balance for withdrawal.",
    );

    schemaCoverage(paramsSchema, params);
  },
});
