import { type BorrowLendUserStateParameters, BorrowLendUserStateRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/borrowLendUserState.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "BorrowLendUserStateResponse");
const paramsSchema = valibotToJsonSchema(v.omit(BorrowLendUserStateRequest, ["type"]));

runTest({
  name: "borrowLendUserState",
  isTestnet: false,
  codeTestFn: async (_t, client) => {
    const params: BorrowLendUserStateParameters[] = [
      { user: "0x0000000000000000000000000000000000000001" }, // healthFactor: null
      { user: "0xf02d16a272a842f8bac1d9a9e773aba1933454c6" }, // "healthy"
      { user: "0xe639710e64d7094f7f82ab495915559c2f612953" }, // "atRisk"
    ];

    const data = await Promise.all(params.map((p) => client.borrowLendUserState(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/properties/health/enum/2", // "marketLiquidatable"
      "#/properties/health/enum/3", // "backstopLiquidatable"
    ]);
  },
});
