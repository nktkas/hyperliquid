import { parser, UserFillsByTimeRequest, UserFillsByTimeResponse } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "userFillsByTime",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userFillsByTime({
        user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
        startTime: Date.now() - 1000 * 60 * 60 * 24 * 365 * 5,
      }),
    ]);
    schemaCoverage(UserFillsByTimeResponse, data, {
      ignoreDefinedTypes: [
        "#/items/properties/twapId",
      ],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userFillsByTime",
      "--user",
      "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
      "--startTime",
      "1725991229384",
    ]);
    parser(UserFillsByTimeRequest)(JSON.parse(data));
  },
});
