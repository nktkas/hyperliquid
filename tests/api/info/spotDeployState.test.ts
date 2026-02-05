import * as v from "@valibot/valibot";
import { SpotDeployStateRequest, SpotDeployStateResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "spotDeployState",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.spotDeployState({ user: "0x051dbfc562d44e4a01ebb986da35a47ab4f346db" }), // states.fullName = string
      client.spotDeployState({ user: "0xd8cb8d9747f50be8e423c698f9104ee090540961" }), // states.fullName = null
      client.spotDeployState({ user: "0x051dbfc562d44e4a01ebb986da35a47ab4f346db" }), // states.maxSupply = string
      client.spotDeployState({ user: "0xd8cb8d9747f50be8e423c698f9104ee090540961" }), // states.maxSupply = null
    ]);
    schemaCoverage(SpotDeployStateResponse, data, [
      "#/properties/states/items/properties/blacklistUsers/array",
      "#/properties/gasAuction/properties/currentGas/defined",
      "#/properties/gasAuction/properties/endGas/null",
      "#/properties/gasAuction/properties/currentGas/null",
      "#/properties/gasAuction/properties/endGas/defined",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "spotDeployState",
      "--user=0x051dbfc562d44e4a01ebb986da35a47ab4f346db",
    ]);
    v.parse(SpotDeployStateRequest, data);
  },
});
