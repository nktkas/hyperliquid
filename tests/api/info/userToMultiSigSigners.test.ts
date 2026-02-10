import * as v from "@valibot/valibot";
import { type UserToMultiSigSignersParameters, UserToMultiSigSignersRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userToMultiSigSigners.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserToMultiSigSignersResponse");
const paramsSchema = valibotToJsonSchema(v.omit(UserToMultiSigSignersRequest, ["type"]));

runTest({
  name: "userToMultiSigSigners",
  codeTestFn: async (_t, client) => {
    const params: UserToMultiSigSignersParameters[] = [
      { user: "0x7A8b673a176a430b80cfCDfdFB6b10ED55010Ebb" }, // { ... }
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, // null
    ];

    const data = await Promise.all(params.map((p) => client.userToMultiSigSigners(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
