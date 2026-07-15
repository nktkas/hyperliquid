import { type UserDexAbstractionParameters, UserDexAbstractionRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userDexAbstraction.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserDexAbstractionResponse");
const paramsSchema = valibotToJsonSchema(v.omit(UserDexAbstractionRequest, ["type"]));

runTest({
  name: "userDexAbstraction",
  codeTestFn: async (_t, client) => {
    const params: UserDexAbstractionParameters[] = [
      { user: "0x0000000000000000000000000000000000000001" }, // null
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, // false
    ];

    const data = await Promise.all(params.map((p) => client.userDexAbstraction(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
