import { type UserAbstractionParameters, UserAbstractionRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userAbstraction.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserAbstractionResponse");
const paramsSchema = valibotToJsonSchema(v.omit(UserAbstractionRequest, ["type"]));

runTest({
  name: "userAbstraction",
  codeTestFn: async (_t, client) => {
    const params: UserAbstractionParameters[] = [
      { user: "0x0000000000000000000000000000000000000001" }, // "default"
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, // "dexAbstraction"
    ];

    const data = await Promise.all(params.map((p) => client.userAbstraction(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/enum/0", // "unifiedAccount" — not tested
      "#/enum/1", // "portfolioMargin" — not tested
      "#/enum/2", // "disabled" — not tested
    ]);
  },
});
