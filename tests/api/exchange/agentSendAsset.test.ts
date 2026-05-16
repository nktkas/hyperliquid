import { type AgentSendAssetParameters, AgentSendAssetRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { createAgentExchangeClient, runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/agentSendAsset.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "AgentSendAssetSuccessResponse");
const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(AgentSendAssetRequest.entries.action.entries), ["type", "nonce"]),
);

runTest({
  name: "agentSendAsset",
  skipMultiSig: true,
  codeTestFn: async (_t, exchClient) => {
    const { agentExch, principal } = await createAgentExchangeClient(exchClient);

    // Server requires destination = principal (or its sub-account).
    const params: AgentSendAssetParameters[] = [
      // fromSubAccount=""
      {
        destination: principal,
        sourceDex: "",
        destinationDex: "test",
        token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
        amount: "0.01",
        fromSubAccount: "",
      },
      // fromSubAccount=missing
      {
        destination: principal,
        sourceDex: "",
        destinationDex: "test",
        token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
        amount: "0.01",
      },
    ];

    const data = await Promise.all(params.map((p) => agentExch.agentSendAsset(p)));

    schemaCoverage(paramsSchema, params, [
      "#/properties/fromSubAccount/anyOf/1", // Address requires registered sub-account
    ]);
    schemaCoverage(responseSchema, data);
  },
});
