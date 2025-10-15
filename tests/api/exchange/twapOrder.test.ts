// deno-lint-ignore-file no-import-prefix
import { parser, TwapOrderRequest, TwapOrderSuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { BigNumber } from "npm:bignumber.js@9";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { formatSize, getAssetData, runTest } from "./_t.ts";

runTest({
  name: "twapOrder",
  topup: { perp: "60" },
  codeTestFn: async (_t, clients) => {
    // —————————— Prepare ——————————

    const { id, universe, ctx } = await getAssetData("BTC");
    const sz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    const data = await Promise.all([
      clients.exchange.twapOrder({
        twap: {
          a: id,
          b: true,
          s: sz,
          r: false,
          m: 5,
          t: false,
        },
      }),
    ]);
    schemaCoverage(TwapOrderSuccessResponse, data);

    // —————————— Cleanup ——————————

    await clients.exchange.twapCancel({ a: id, t: data[0].response.data.status.running.twapId });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "twapOrder",
      "--a",
      "0",
      "--b",
      "true",
      "--s",
      "0",
      "--r",
      "false",
      "--m",
      "5",
      "--t",
      "false",
    ]);
    parser(TwapOrderRequest)(JSON.parse(data));
  },
});
