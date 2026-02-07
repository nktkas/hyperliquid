import * as v from "@valibot/valibot";
import { ApproveAgentRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/approveAgent.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "ApproveAgentSuccessResponse");

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
      schemaCoverage(typeSchema, data);
    });

    await new Promise((r) => setTimeout(r, 5000)); // waiting to avoid error `ApiRequestError: User has pending agent removal`

    await t.step("without 'agentName'", async () => {
      const data = await Promise.all([
        exchClient.approveAgent({
          agentAddress: randomAddress(),
          agentName: null,
        }),
      ]);
      schemaCoverage(typeSchema, data);
    });

    await new Promise((r) => setTimeout(r, 5000)); // waiting to avoid error `ApiRequestError: User has pending agent removal`

    await t.step("with expiration timestamp in 'agentName'", async () => {
      const expirationTimestamp = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
      const data = await Promise.all([
        exchClient.approveAgent({
          agentAddress: randomAddress(),
          agentName: `test valid_until ${expirationTimestamp}`,
        }),
      ]);
      schemaCoverage(typeSchema, data);
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "approveAgent",
      "--agentAddress=0x0000000000000000000000000000000000000000",
    ]);
    v.parse(ApproveAgentRequest, data);
  },
});

function randomAddress(): `0x${string}` {
  return `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
}
