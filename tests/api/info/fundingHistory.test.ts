import * as v from "@valibot/valibot";
import { type FundingHistoryParameters, FundingHistoryRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/fundingHistory.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "FundingHistoryResponse");
const paramsSchema = valibotToJsonSchema(v.omit(FundingHistoryRequest, ["type"]));

runTest({
  name: "fundingHistory",
  codeTestFn: async (_t, client) => {
    const now = Date.now();
    const year = 1000 * 60 * 60 * 24 * 365;
    const params: FundingHistoryParameters[] = [
      { coin: "ETH", startTime: now - year },
      { coin: "ETH", startTime: now - year, endTime: now },
      { coin: "ETH", startTime: now - year, endTime: null },
    ];

    const data = await Promise.all(params.map((p) => client.fundingHistory(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
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
