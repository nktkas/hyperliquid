import { parser, TwapCancelRequest, TwapCancelSuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { createTWAP, runTest } from "./_t.ts";

runTest({
  name: "twapCancel",
  codeTestFn: async (_t, exchClient) => {
    // —————————— Prepare ——————————

    const twap = await createTWAP(exchClient);

    // —————————— Test ——————————

    const data = await Promise.all([
      exchClient.twapCancel({ a: twap.a, t: twap.twapId }),
    ]);
    schemaCoverage(TwapCancelSuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "twapCancel", "--a", "0", "--t", "0"]);
    parser(TwapCancelRequest)(data);
  },
});
