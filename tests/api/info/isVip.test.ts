import * as v from "@valibot/valibot";
import { type IsVipParameters, IsVipRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/isVip.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "IsVipResponse");
const paramsSchema = valibotToJsonSchema(v.omit(IsVipRequest, ["type"]));

runTest({
  name: "isVip",
  codeTestFn: async (_t, client) => {
    const params: IsVipParameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
    ];

    const data = await Promise.all(params.map((p) => client.isVip(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/null",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "isVip",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(IsVipRequest, data);
  },
});
