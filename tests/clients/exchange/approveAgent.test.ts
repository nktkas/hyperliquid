import { generatePrivateKey, privateKeyToAddress } from "npm:viem@2/accounts";
import type { ExchangeClient, InfoClient, MultiSignClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["approveAgent"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    await t.step("with 'agentName'", async () => {
        const data = await client.exchange.approveAgent({
            agentAddress: privateKeyToAddress(generatePrivateKey()),
            agentName: "agentName",
        });
        schemaCoverage(MethodReturnType, [data]);
    });

    await new Promise((r) => setTimeout(r, 5000)); // waiting to avoid error `ApiRequestError: User has pending agent removal`

    await t.step("without 'agentName'", async () => {
        const data = await client.exchange.approveAgent({
            agentAddress: privateKeyToAddress(generatePrivateKey()),
            agentName: null,
        });
        schemaCoverage(MethodReturnType, [data]);
    });
}

runTest("approveAgent", testFn);
