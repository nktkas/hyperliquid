import * as v from "@valibot/valibot";
import { CandleSnapshotRequest, CandleSnapshotResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "candleSnapshot",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.candleSnapshot({ coin: "ETH", interval: "15m", startTime: Date.now() - 1000 * 60 * 60 * 24 }),
    ]);
    schemaCoverage(CandleSnapshotResponse, data, [
      "#/items/properties/i/picklist/0",
      "#/items/properties/i/picklist/1",
      "#/items/properties/i/picklist/2",
      "#/items/properties/i/picklist/4",
      "#/items/properties/i/picklist/5",
      "#/items/properties/i/picklist/6",
      "#/items/properties/i/picklist/7",
      "#/items/properties/i/picklist/8",
      "#/items/properties/i/picklist/9",
      "#/items/properties/i/picklist/10",
      "#/items/properties/i/picklist/11",
      "#/items/properties/i/picklist/12",
      "#/items/properties/i/picklist/13",
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
