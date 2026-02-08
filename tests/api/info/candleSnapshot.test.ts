import * as v from "@valibot/valibot";
import { type CandleSnapshotParameters, CandleSnapshotRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/candleSnapshot.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "CandleSnapshotResponse");
const paramsSchema = valibotToJsonSchema(CandleSnapshotRequest.entries.req);

runTest({
  name: "candleSnapshot",
  codeTestFn: async (_t, client) => {
    const now = Date.now();
    const day = 1000 * 60 * 60 * 24;
    const params: CandleSnapshotParameters[] = [
      { coin: "ETH", interval: "1m", startTime: now - day },
      { coin: "ETH", interval: "3m", startTime: now - day },
      { coin: "ETH", interval: "5m", startTime: now - day },
      { coin: "ETH", interval: "15m", startTime: now - day },
      { coin: "ETH", interval: "30m", startTime: now - day },
      { coin: "ETH", interval: "1h", startTime: now - day },
      { coin: "ETH", interval: "2h", startTime: now - day },
      { coin: "ETH", interval: "4h", startTime: now - day },
      { coin: "ETH", interval: "8h", startTime: now - day },
      { coin: "ETH", interval: "12h", startTime: now - day },
      { coin: "ETH", interval: "1d", startTime: now - day },
      { coin: "ETH", interval: "3d", startTime: now - day },
      { coin: "ETH", interval: "1w", startTime: now - day },
      { coin: "ETH", interval: "1M", startTime: now - day },
      { coin: "ETH", interval: "1m", startTime: now - day, endTime: now },
      { coin: "ETH", interval: "1m", startTime: now - day, endTime: null },
    ];

    const data = await Promise.all(params.map((p) => client.candleSnapshot(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "candleSnapshot",
      "--coin=ETH",
      "--interval=15m",
      "--startTime=1757440693681",
    ]);
    v.parse(CandleSnapshotRequest, data);
  },
});
