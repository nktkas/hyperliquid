import { type ApproveAgentParameters, ApproveAgentRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/approveAgent.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "ApproveAgentSuccessResponse");
const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(ApproveAgentRequest.entries.action.entries), [
    "type",
    "signatureChainId",
    "hyperliquidChain",
    "nonce",
  ]),
);

runTest({
  name: "approveAgent",
  codeTestFn: async (_t, exchClient) => {
    // agentName=string
    const withName = await (async () => {
      const params: ApproveAgentParameters = {
        agentAddress: randomAddress(),
        agentName: "agentName",
      };
      return { params, result: await exchClient.approveAgent(params) };
    })();

    await new Promise((r) => setTimeout(r, 5000)); // waiting to avoid error `ApiRequestError: User has pending agent removal`

    // agentName=null
    const withoutName = await (async () => {
      const params: ApproveAgentParameters = {
        agentAddress: randomAddress(),
        agentName: null,
      };
      return { params, result: await exchClient.approveAgent(params) };
    })();

    await new Promise((r) => setTimeout(r, 5000)); // waiting to avoid error `ApiRequestError: User has pending agent removal`

    // agentName=string (with expiration timestamp)
    const withExpiration = await (async () => {
      const expirationTimestamp = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
      const params: ApproveAgentParameters = {
        agentAddress: randomAddress(),
        agentName: `test valid_until ${expirationTimestamp}`,
      };
      return { params, result: await exchClient.approveAgent(params) };
    })();

    await new Promise((r) => setTimeout(r, 5000)); // waiting to avoid error `ApiRequestError: User has pending agent removal`

    // agentName=missing
    const withoutNameMissing = await (async () => {
      const params: ApproveAgentParameters = {
        agentAddress: randomAddress(),
      };
      return { params, result: await exchClient.approveAgent(params) };
    })();

    const data = [withName, withoutName, withExpiration, withoutNameMissing];

    schemaCoverage(paramsSchema, data.map((d) => d.params));
    schemaCoverage(responseSchema, data.map((d) => d.result));
  },
});

function randomAddress(): `0x${string}` {
  return `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
}
