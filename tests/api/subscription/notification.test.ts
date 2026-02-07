import type { NotificationEvent } from "@nktkas/hyperliquid/api/subscription";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { collectEventsOverTime, createTWAP, runTestWithExchange } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/notification.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "NotificationEvent");

runTestWithExchange({
  name: "notification",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<NotificationEvent>(async (cb) => {
      const user = await getWalletAddress(
        "multiSigUser" in client.exch.config_ ? client.exch.config_.signers[0] : client.exch.config_.wallet,
      );
      await client.subs.notification({ user }, cb);
      await createTWAP(client.exch);
    }, 10_000);
    schemaCoverage(typeSchema, data);
  },
});
