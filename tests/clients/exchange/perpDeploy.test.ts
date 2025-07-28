import { assertRejects } from "jsr:@std/assert@1";
import { ApiRequestError, type ExchangeClient, type InfoClient, type MultiSignClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["perpDeploy"]>>;
const _MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    await t.step("registerAsset", async () => {
        await assertRejects(
            () =>
                client.exchange.perpDeploy({
                    registerAsset: {
                        maxGas: 1000000000000,
                        assetRequest: {
                            coin: "1",
                            szDecimals: 1,
                            oraclePx: "1",
                            marginTableId: 1,
                            onlyIsolated: true,
                        },
                        dex: "test",
                        schema: null,
                    },
                }),
            ApiRequestError,
            "Error deploying perp:",
        );
    });
    await t.step("setOracle", async () => {
        await assertRejects(
            () =>
                client.exchange.perpDeploy({
                    setOracle: {
                        dex: "test",
                        oraclePxs: [["TEST0", "12.0"], ["TEST1", "1"]],
                        markPxs: [[["TEST0", "3.0"], ["TEST1", "14"]]],
                    },
                }),
            ApiRequestError,
            "Error deploying perp:",
        );
    });
}

runTest("perpDeploy", testFn);
