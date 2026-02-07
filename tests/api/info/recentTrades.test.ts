import * as v from "@valibot/valibot";
import { RecentTradesRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/recentTrades.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "RecentTradesResponse");

runTest({
  name: "recentTrades",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.recentTrades({ coin: "ETH" }),
    ]);
    schemaCoverage(typeSchema, data, [
      "#/items/properties/side/enum/0",
      "#/items/properties/side/enum/1",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "recentTrades",
      "--coin=ETH",
    ]);
    v.parse(RecentTradesRequest, data);
  },
});
