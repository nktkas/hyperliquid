import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertRejects } from "jsr:@std/assert@1";
import { runTest } from "./_t.ts";

runTest({
  name: "agentEnableDexAbstraction",
  codeTestFn: async (_t, exchClient) => {
    await exchClient.agentSetAbstraction({ abstraction: "u" });

    await assertRejects(
      () => exchClient.agentEnableDexAbstraction(),
      ApiRequestError,
      "Abstraction transition not allowed",
    );
  },
});
