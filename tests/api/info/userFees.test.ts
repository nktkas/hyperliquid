import { type UserFeesParameters, UserFeesRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userFees.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserFeesResponse");
const paramsSchema = valibotToJsonSchema(v.omit(UserFeesRequest, ["type"]));

runTest({
  name: "userFees",
  codeTestFn: async (_t, client) => {
    const params: UserFeesParameters[] = [
      { user: "0xe973105a27e17350500926ae664dfcfe6006d924" },
      { user: "0x768484f7e2ebb675c57838366c02ae99ba2a9b08" }, // userAddRate/userSpotAddRate negative
      { user: "0xeffb9c711ec1d3e551a7391dd848290a614c2e63" }, // stakingLink.type = tradingUser
      { user: "0xc066dda6748bc50b4fa17720b215783f5d60045f" }, // stakingLink.type = stakingUser
    ];

    const data = await Promise.all(params.map((p) => client.userFees(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/properties/trial/defined",
      "#/properties/stakingLink/anyOf/0/properties/type/enum/0",
    ]);
  },
});
