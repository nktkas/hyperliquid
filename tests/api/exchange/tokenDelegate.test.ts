import { type TokenDelegateParameters, TokenDelegateRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest, topUpSpot } from "./_t.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/tokenDelegate.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "TokenDelegateSuccessResponse");
const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(TokenDelegateRequest.entries.action.entries), [
    "type",
    "signatureChainId",
    "hyperliquidChain",
    "nonce",
  ]),
);

runTest({
  name: "tokenDelegate",
  codeTestFn: async (_t, exchClient) => {
    // --- Prepare ---------------------------------------------------

    await topUpSpot(exchClient, "HYPE", "0.00000001");
    await exchClient.cDeposit({ wei: 1 });

    // --- Test ------------------------------------------------------

    const params: TokenDelegateParameters[] = [
      // isUndelegate=false (delegate)
      {
        validator: "0xa012b9040d83c5cbad9e6ea73c525027b755f596",
        wei: 1,
        isUndelegate: false,
      },
    ];

    const data = await Promise.all(params.map((p) => exchClient.tokenDelegate(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
