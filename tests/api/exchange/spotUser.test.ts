import * as v from "@valibot/valibot";
import { SpotUserRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/spotUser.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "SpotUserSuccessResponse");

runTest({
  name: "spotUser",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.spotUser({ toggleSpotDusting: { optOut: true } }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "spotUser",
      `--toggleSpotDusting=${JSON.stringify({ optOut: true })}`,
    ]);
    v.parse(SpotUserRequest, data);
  },
});
