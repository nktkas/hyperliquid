import * as v from "@valibot/valibot";
import { type PortfolioParameters, PortfolioRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/portfolio.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "PortfolioResponse");
const paramsSchema = valibotToJsonSchema(v.omit(PortfolioRequest, ["type"]));

runTest({
  name: "portfolio",
  codeTestFn: async (_t, client) => {
    const params: PortfolioParameters[] = [
      { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
    ];

    const data = await Promise.all(params.map((p) => client.portfolio(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "portfolio",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(PortfolioRequest, data);
  },
});
