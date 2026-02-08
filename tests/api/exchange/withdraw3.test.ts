import * as v from "@valibot/valibot";
import { type Withdraw3Parameters, Withdraw3Request } from "@nktkas/hyperliquid/api/exchange";
import { runTest, topUpPerp } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/withdraw3.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "Withdraw3SuccessResponse");
const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(Withdraw3Request.entries.action.entries), ["type", "signatureChainId", "hyperliquidChain", "time"]),
);

runTest({
  name: "withdraw3",
  codeTestFn: async (_t, exchClient) => {
    await topUpPerp(exchClient, "2");

    const params: Withdraw3Parameters[] = [
      { amount: "2", destination: "0x0000000000000000000000000000000000000001" },
    ];

    const data = await Promise.all(params.map((p) => exchClient.withdraw3(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "withdraw3",
      "--amount=2",
      "--destination=0x0000000000000000000000000000000000000001",
    ]);
    v.parse(Withdraw3Request, data);
  },
});
