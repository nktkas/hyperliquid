import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/gossipPriorityAuctionStatus.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "GossipPriorityAuctionStatusResponse");

runTest({
  name: "gossipPriorityAuctionStatus",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.gossipPriorityAuctionStatus()]);

    schemaCoverage(responseSchema, data, [
      // Testnet has no previous winners — only `null` entries are present.
      "#/items/0/items/defined",
      // Testnet auctions never reach the end-of-window state in a single snapshot.
      "#/items/1/items/properties/currentGas/defined",
      "#/items/1/items/properties/currentGas/null",
      "#/items/1/items/properties/endGas/null",
      "#/items/1/items/properties/endGas/defined",
    ]);
  },
});
