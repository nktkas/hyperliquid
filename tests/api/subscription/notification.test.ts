import * as v from "@valibot/valibot";
import {
  type NotificationEvent,
  type NotificationParameters,
  NotificationRequest,
} from "@nktkas/hyperliquid/api/subscription";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { collectEventsOverTime, createTWAP, runTestWithExchange } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/notification.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "NotificationEvent");
const paramsSchema = valibotToJsonSchema(v.omit(NotificationRequest, ["type"]));

runTestWithExchange({
  name: "notification",
  fn: async (_t, client) => {
    const user = await getWalletAddress(
      "multiSigUser" in client.exch.config_ ? client.exch.config_.signers[0] : client.exch.config_.wallet,
    );
    const params: NotificationParameters[] = [{ user }];

    const data = await collectEventsOverTime<NotificationEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.subs.notification(p, cb)));
      await createTWAP(client.exch);
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
