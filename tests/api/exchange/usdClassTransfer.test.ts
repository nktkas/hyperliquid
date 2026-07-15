import { ApiRequestError } from "@nktkas/hyperliquid";
import { type UsdClassTransferParameters, UsdClassTransferRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/usdClassTransfer.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UsdClassTransferSuccessResponse");
const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(UsdClassTransferRequest.entries.action.entries), [
    "type",
    "signatureChainId",
    "hyperliquidChain",
    "nonce",
  ]),
);

runTest({
  name: "usdClassTransfer",
  codeTestFn: async (_t, exchClient) => {
    const perpToSpot = await (async () => {
      const params: UsdClassTransferParameters = { amount: "1", toPerp: false };
      return { params, result: await exchClient.usdClassTransfer(params) };
    })();

    const spotToPerp = await (async () => {
      const params: UsdClassTransferParameters = { amount: "1", toPerp: true };
      return { params, result: await exchClient.usdClassTransfer(params) };
    })();

    const subAccountParams: UsdClassTransferParameters = {
      amount: "1 subaccount:0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
      toPerp: false,
    };
    await assertRejects(
      () => exchClient.usdClassTransfer(subAccountParams),
      ApiRequestError,
      "Sub-account 0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1 is not registered to",
    );

    const data = [perpToSpot, spotToPerp];

    schemaCoverage(paramsSchema, [...data.map((d) => d.params), subAccountParams]);
    schemaCoverage(responseSchema, data.map((d) => d.result));
  },
});
