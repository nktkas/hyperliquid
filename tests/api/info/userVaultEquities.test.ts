import { type UserVaultEquitiesParameters, UserVaultEquitiesRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userVaultEquities.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserVaultEquitiesResponse");
const paramsSchema = valibotToJsonSchema(v.omit(UserVaultEquitiesRequest, ["type"]));

runTest({
  name: "userVaultEquities",
  codeTestFn: async (_t, client) => {
    const params: UserVaultEquitiesParameters[] = [
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" },
    ];

    const data = await Promise.all(params.map((p) => client.userVaultEquities(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
