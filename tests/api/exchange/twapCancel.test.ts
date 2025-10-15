// deno-lint-ignore-file no-import-prefix
import { parser, TwapCancelRequest, TwapCancelSuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { BigNumber } from "npm:bignumber.js@9";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { formatSize, getAssetData, runTest } from "./_t.ts";

runTest({
  name: "twapCancel",
  topup: { perp: "60" },
  codeTestFn: async (_t, clients) => {
    // —————————— Prepare ——————————

    async function createTWAP(id: number, sz: string) {
      const twapOrderResult = await clients.exchange.twapOrder({
        twap: {
          a: id,
          b: true,
          s: sz,
          r: false,
          m: 5,
          t: false,
        },
      });
      const twapId = twapOrderResult.response.data.status.running.twapId;
      return twapId;
    }

    const { id, universe, ctx } = await getAssetData("BTC");
    const sz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    const data = await Promise.all([
      clients.exchange.twapCancel({ a: id, t: await createTWAP(id, sz) }),
    ]);
    schemaCoverage(TwapCancelSuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "twapCancel", "--a", "0", "--t", "0"]);
    parser(TwapCancelRequest)(JSON.parse(data));
  },
});
