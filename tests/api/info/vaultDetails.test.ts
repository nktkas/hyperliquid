import * as v from "@valibot/valibot";
import { type VaultDetailsParameters, VaultDetailsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/vaultDetails.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "VaultDetailsResponse");
const paramsSchema = valibotToJsonSchema(v.omit(VaultDetailsRequest, ["type"]));

runTest({
  name: "vaultDetails",
  codeTestFn: async (_t, client) => {
    const params: VaultDetailsParameters[] = [
      { vaultAddress: "0x1719884eb866cb12b2287399b15f7db5e7d775ea" }, // relationship.type = normal, user absent
      { vaultAddress: "0x768484f7e2ebb675c57838366c02ae99ba2a9b08", user: null }, // relationship.type = child, user null
      {
        vaultAddress: "0xa15099a30bbf2e68942d6f4c43d70d04faeab0a0",
        user: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
      }, // relationship.type = parent, user present
    ];

    const data = await Promise.all(params.map((p) => client.vaultDetails(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
