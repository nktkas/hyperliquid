import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import { assertRejects } from "jsr:@std/assert@1";
import { ApiRequestError, ExchangeClient, type Hex, HttpTransport } from "../../../mod.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;

// —————————— Test ——————————

// NOTE: This API is difficult to test with a successful response.
// So to prove that the method works, we will expect a specific error
Deno.test("perpDeploy", { ignore: !PRIVATE_KEY }, async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const exchClient = new ExchangeClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    await Promise.all([
        // Register Asset | maxGas
        assertRejects( // exists
            () =>
                exchClient.perpDeploy({
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
                exchClient.perpDeploy({
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
                exchClient.perpDeploy({
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
