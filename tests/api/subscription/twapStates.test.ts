import * as v from "@valibot/valibot";
import {
  type TwapStatesEvent,
  type TwapStatesParameters,
  TwapStatesRequest,
} from "@nktkas/hyperliquid/api/subscription";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { collectEventsOverTime, createTWAP, runTestWithExchange } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/twapStates.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "TwapStatesEvent");
const paramsSchema = valibotToJsonSchema(v.omit(TwapStatesRequest, ["type"]));

runTestWithExchange({
  name: "twapStates",
  fn: async (_t, client) => {
    const user = await getWalletAddress(
      "multiSigUser" in client.exch.config_ ? client.exch.config_.signers[0] : client.exch.config_.wallet,
    );
    const params: TwapStatesParameters[] = [
      { user },
      { user, dex: "" },
    ];

    const data = await collectEventsOverTime<TwapStatesEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.subs.twapStates(p, cb)));
      await createTWAP(client.exch);
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/properties/states/items/items/1/properties/side/enum/1",
    ]);
  },
});
