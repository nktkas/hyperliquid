import * as v from "@valibot/valibot";
import { CandleSnapshotRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/candleSnapshot.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "CandleSnapshotResponse");

runTest({
  name: "candleSnapshot",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.candleSnapshot({ coin: "ETH", interval: "15m", startTime: Date.now() - 1000 * 60 * 60 * 24 }),
    ]);
    schemaCoverage(typeSchema, data, [
      "#/items/properties/i/enum/0",
      "#/items/properties/i/enum/1",
      "#/items/properties/i/enum/2",
      "#/items/properties/i/enum/4",
      "#/items/properties/i/enum/5",
      "#/items/properties/i/enum/6",
      "#/items/properties/i/enum/7",
      "#/items/properties/i/enum/8",
      "#/items/properties/i/enum/9",
      "#/items/properties/i/enum/10",
      "#/items/properties/i/enum/11",
      "#/items/properties/i/enum/12",
      "#/items/properties/i/enum/13",
    ]);
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
