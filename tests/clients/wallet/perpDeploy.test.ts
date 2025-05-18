import { assertRejects } from "jsr:@std/assert@^1.0.10";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { ApiRequestError, HttpTransport, WalletClient } from "../../../mod.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;

// —————————— Test ——————————

// NOTE: This API is difficult to test with a successful response.
// So to prove that the method works, we will expect a specific error
Deno.test("perpDeploy", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    await Promise.all([
        // Register Asset | maxGas
        assertRejects( // exists
            () =>
                walletClient.perpDeploy({
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
                    },
                }),
            ApiRequestError,
            "Error deploying perp:",
        ),
        assertRejects( // does not exist
            () =>
                walletClient.perpDeploy({
                    registerAsset: {
                        assetRequest: {
                            coin: "1",
                            szDecimals: 1,
                            oraclePx: "1",
                            marginTableId: 1,
                            onlyIsolated: true,
                        },
                        dex: "test",
                    },
                }),
            ApiRequestError,
            "Error deploying perp:",
        ),
        // Set Oracle
        assertRejects(
            () =>
                walletClient.perpDeploy({
                    setOracle: {
                        dex: "test",
                        oraclePxs: [["TEST0", "12.0"], ["TEST1", "1"]],
                        markPxs: [["TEST0", "3.0"], ["TEST1", "14"]],
                    },
                }),
            ApiRequestError,
            "Error deploying perp:",
        ),
    ]);
});
