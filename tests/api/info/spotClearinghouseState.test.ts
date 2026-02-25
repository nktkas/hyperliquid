import { type SpotClearinghouseStateParameters, SpotClearinghouseStateRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/spotClearinghouseState.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "SpotClearinghouseStateResponse");
const paramsSchema = valibotToJsonSchema(v.omit(SpotClearinghouseStateRequest, ["type"]));

runTest({
  name: "spotClearinghouseState",
  codeTestFn: async (_t, client) => {
    const params: SpotClearinghouseStateParameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, // balances.length > 0
      { user: "0x1defed46db35334232b9f5fd2e5c6180276fb99d" }, // evmEscrows.length > 0
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", dex: "gato" },
    ];

    const data = await Promise.all(params.map((p) => client.spotClearinghouseState(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
