import { parser, SpotDeployStateRequest, SpotDeployStateResponse } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "spotDeployState",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.spotDeployState({ user: "0x051dbfc562d44e4a01ebb986da35a47ab4f346db" }), // states.fullName = string
      client.spotDeployState({ user: "0xd8cb8d9747f50be8e423c698f9104ee090540961" }), // states.fullName = null
      client.spotDeployState({ user: "0x051dbfc562d44e4a01ebb986da35a47ab4f346db" }), // states.maxSupply = string
      client.spotDeployState({ user: "0xd8cb8d9747f50be8e423c698f9104ee090540961" }), // states.maxSupply = null
    ]);
    schemaCoverage(SpotDeployStateResponse, data, {
      ignoreEmptyArray: ["#/properties/states/items/properties/blacklistUsers"],
      ignoreDefinedTypes: [
        "#/properties/gasAuction/properties/currentGas",
        "#/properties/gasAuction/properties/endGas",
      ],
      ignoreNullTypes: [
        "#/properties/gasAuction/properties/endGas",
        "#/properties/gasAuction/properties/currentGas",
      ],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "spotDeployState",
      "--user",
      "0x051dbfc562d44e4a01ebb986da35a47ab4f346db",
    ]);
    parser(SpotDeployStateRequest)(JSON.parse(data));
  },
});
