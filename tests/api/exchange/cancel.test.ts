import { CancelRequest, CancelSuccessResponse, parser } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { openOrder, runTest } from "./_t.ts";

runTest({
  name: "cancel",
  codeTestFn: async (_t, exchClient) => {
    // —————————— Prepare ——————————

    const order = await openOrder(exchClient, "limit");

    // —————————— Test ——————————

    const data = await Promise.all([
      exchClient.cancel({ cancels: [{ a: order.a, o: order.oid }] }),
    ]);
    schemaCoverage(CancelSuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "cancel",
      "--cancels",
      JSON.stringify([{ a: 0, o: 0 }]),
    ]);
    parser(CancelRequest)(data);
  },
});
