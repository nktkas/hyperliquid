import * as v from "@valibot/valibot";
import { type BorrowLendParameters, BorrowLendRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest, topUpSpot } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/borrowLend.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "BorrowLendSuccessResponse");
const paramsSchema = valibotToJsonSchema(v.omit(v.object(BorrowLendRequest.entries.action.entries), ["type"]));

runTest({
  name: "borrowLend",
  codeTestFn: async (_t, exchClient) => {
    await topUpSpot(exchClient, "USDC", "30");

    // supply | amount=string
    const supply = await (async () => {
      const params: BorrowLendParameters = { operation: "supply", token: 0, amount: "30" };
      return { params, result: await exchClient.borrowLend(params) };
    })();
    // withdraw | amount=null
    const withdraw = await (async () => {
      const params: BorrowLendParameters = { operation: "withdraw", token: 0, amount: null };
      return { params, result: await exchClient.borrowLend(params) };
    })();

    const data = [supply, withdraw];

    schemaCoverage(paramsSchema, data.map((d) => d.params), [
      "#/properties/operation/enum/2", // 'repay' - not available
      "#/properties/operation/enum/3", // 'borrow' - not available
    ]);
    schemaCoverage(responseSchema, data.map((d) => d.result));
  },
});
