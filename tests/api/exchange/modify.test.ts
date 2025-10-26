import { ModifyRequest, parser, SuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { openOrder, runTest } from "./_t.ts";

runTest({
  name: "modify",
  codeTestFn: async (_t, exchClient) => {
    // —————————— Prepare ——————————

    const order = await openOrder(exchClient, "limit");

    // —————————— Test ——————————

    const data = await Promise.all([
      exchClient.modify({
        oid: order.oid,
        order: {
          a: order.a,
          b: order.b,
          p: order.p,
          s: order.s,
          r: false,
          t: { limit: { tif: "Gtc" } },
        },
      }),
    ]);
    schemaCoverage(SuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "modify",
      "--oid",
      "0",
      "--order",
      JSON.stringify({
        a: 0,
        b: true,
        p: "1",
        s: "1",
        r: false,
        t: { limit: { tif: "Gtc" } },
      }),
    ]);
    parser(ModifyRequest)(data);
  },
});
