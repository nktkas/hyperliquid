import { ApiRequestError } from "@nktkas/hyperliquid";
import { type GossipPriorityBidParameters, GossipPriorityBidRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(GossipPriorityBidRequest.entries.action.entries), ["type"]),
);

runTest({
  name: "gossipPriorityBid",
  codeTestFn: async (_t, exchClient) => {
    const params: GossipPriorityBidParameters[] = [
      // slotId=0
      { slotId: 0, ip: "1.2.3.4", maxGas: 100_000_000 },
      // slotId=1
      { slotId: 1, ip: "1.2.3.4", maxGas: 100_000_000 },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.gossipPriorityBid(p);
        },
        ApiRequestError,
        "Insufficient gas at current auction price.",
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
});
