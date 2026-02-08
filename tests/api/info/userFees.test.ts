import * as v from "@valibot/valibot";
import { type UserFeesParameters, UserFeesRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/userFees.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UserFeesResponse");
const paramsSchema = valibotToJsonSchema(v.omit(UserFeesRequest, ["type"]));

runTest({
  name: "userFees",
  codeTestFn: async (_t, client) => {
    const params: UserFeesParameters[] = [
      { user: "0xe973105a27e17350500926ae664dfcfe6006d924" },
    ];

    const data = await Promise.all(params.map((p) => client.userFees(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/properties/trial/defined",
      "#/properties/nextTrialAvailableTimestamp/defined",
      "#/properties/stakingLink/defined",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userFees",
      "--user=0xe973105a27e17350500926ae664dfcfe6006d924",
    ]);
    v.parse(UserFeesRequest, data);
  },
});
