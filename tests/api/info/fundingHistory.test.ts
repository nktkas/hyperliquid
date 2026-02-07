import * as v from "@valibot/valibot";
import { FundingHistoryRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/fundingHistory.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "FundingHistoryResponse");

runTest({
  name: "fundingHistory",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.fundingHistory({
        coin: "ETH",
        startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
      }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "fundingHistory",
      "--coin=ETH",
      "--startTime=1725991126328",
    ]);
    v.parse(FundingHistoryRequest, data);
  },
});
