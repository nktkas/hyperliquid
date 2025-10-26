import { ApproveAgentRequest, parser, SuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { randomAddress, runTest } from "./_t.ts";

runTest({
  name: "approveAgent",
  codeTestFn: async (t, exchClient) => {
    await t.step("with 'agentName'", async () => {
      const data = await Promise.all([
        exchClient.approveAgent({
          agentAddress: randomAddress(),
          agentName: "agentName",
        }),
      ]);
      schemaCoverage(SuccessResponse, data);
    });

    await new Promise((r) => setTimeout(r, 5000)); // waiting to avoid error `ApiRequestError: User has pending agent removal`

    await t.step("without 'agentName'", async () => {
      const data = await Promise.all([
        exchClient.approveAgent({
          agentAddress: randomAddress(),
          agentName: null,
        }),
      ]);
      schemaCoverage(SuccessResponse, data);
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "approveAgent",
      "--agentAddress",
      "0x0000000000000000000000000000000000000000",
    ]);
    parser(ApproveAgentRequest)(data);
  },
});
