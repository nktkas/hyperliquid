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
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, // "disabled"
      { user: "0x6b043579b088d44400dffa1ef1c5e3e3bfbdf9d2" }, // "portfolioMargin"
      { user: "0x8c9c52889ab9d259195a52fd412c250f8183c960" }, // "unifiedAccount"
    ];

    const data = await Promise.all(params.map((p) => client.userAbstraction(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
