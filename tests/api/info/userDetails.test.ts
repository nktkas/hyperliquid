import { type UserDetailsParameters, UserDetailsRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userDetails.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserDetailsResponse");
const paramsSchema = valibotToJsonSchema(v.omit(UserDetailsRequest, ["type"]));

runTest({
  name: "userDetails",
  codeTestFn: async (_t, client) => {
    const params: UserDetailsParameters[] = [
      { user: "0x9150749C4cec13Dc7c1555D0d664F08d4d81Be83" },
    ];

    const data = await Promise.all(params.map((p) => client.userDetails(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
