import * as v from "@valibot/valibot";
import { type TokenDetailsParameters, TokenDetailsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/tokenDetails.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "TokenDetailsResponse");
const paramsSchema = valibotToJsonSchema(v.omit(TokenDetailsRequest, ["type"]));

runTest({
  name: "tokenDetails",
  codeTestFn: async (_t, client) => {
    const params: TokenDetailsParameters[] = [
      { tokenId: "0x3d8a82efa63e86d54a1922c2afdac61e" }, // genesis = { ... }, deployer = hex, deployGas = string, deployTime = string
      { tokenId: "0xc4bf3f870c0e9465323c0b6ed28096c2" }, // genesis = null, deployer = null, deployTime = null
      { tokenId: "0xeb62eee3685fc4c43992febcd9e75443" }, // deployGas = null
    ];

    const data = await Promise.all(params.map((p) => client.tokenDetails(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/properties/genesis/anyOf/0/properties/blacklistUsers/array",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "tokenDetails",
      "--tokenId=0x3d8a82efa63e86d54a1922c2afdac61e",
    ]);
    v.parse(TokenDetailsRequest, data);
  },
});
