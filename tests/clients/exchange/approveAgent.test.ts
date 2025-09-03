import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { generatePrivateKey, privateKeyToAddress } from "npm:viem@2/accounts";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("approveAgent", async (t, clients) => {
    await t.step("with 'agentName'", async () => {
        const data = await Promise.all([
            clients.exchange.approveAgent({
                agentAddress: privateKeyToAddress(generatePrivateKey()),
                agentName: "agentName",
            }),
        ]);
        schemaCoverage(SuccessResponse, data);
    });

    await new Promise((r) => setTimeout(r, 5000)); // waiting to avoid error `ApiRequestError: User has pending agent removal`

    await t.step("without 'agentName'", async () => {
        const data = await Promise.all([
            clients.exchange.approveAgent({
                agentAddress: privateKeyToAddress(generatePrivateKey()),
                agentName: null,
            }),
        ]);
        schemaCoverage(SuccessResponse, data);
    });
});
