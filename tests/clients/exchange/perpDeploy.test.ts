import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertRejects } from "jsr:@std/assert@1";
import { runTest } from "./_t.ts";

runTest("perpDeploy", async (t, clients) => {
    await t.step("registerAsset", async () => {
        await assertRejects(
            async () => {
                await clients.exchange.perpDeploy({
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
                });
            },
            ApiRequestError,
            "Error deploying perp:",
        );
    });

    await t.step("setOracle", async () => {
        await assertRejects(
            async () => {
                await clients.exchange.perpDeploy({
                    setOracle: {
                        dex: "test",
                        oraclePxs: [["TEST0", "12.0"], ["TEST1", "1"]],
                        markPxs: [[["TEST0", "3.0"], ["TEST1", "14"]]],
                    },
                });
            },
            ApiRequestError,
            "Error deploying perp:",
        );
    });
});
