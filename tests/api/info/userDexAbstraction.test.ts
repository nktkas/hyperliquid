import { parser, UserDexAbstractionInfoRequest, UserDexAbstractionInfoResponse } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "userDexAbstraction",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userDexAbstraction({ user: "0x0000000000000000000000000000000000000001" }), // null
      client.userDexAbstraction({ user: "0x187e15e124b8297a01c355b6a87ae74dd4c0069f" }), // boolean
    ]);
    schemaCoverage(UserDexAbstractionInfoResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userDexAbstraction",
      "--user",
      "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    parser(UserDexAbstractionInfoRequest)(JSON.parse(data));
  },
});
