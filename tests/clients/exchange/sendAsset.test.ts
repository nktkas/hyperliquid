import { parser, SendAssetRequest, SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "sendAsset",
    codeTestFn: async (_t, clients) => {
        const data = await Promise.all([
            clients.exchange.sendAsset({
                destination: "0x0000000000000000000000000000000000000001",
                sourceDex: "",
                destinationDex: "test",
                token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
                amount: "1",
                fromSubAccount: "",
            }),
        ]);
        schemaCoverage(SuccessResponse, data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand([
            "exchange",
            "sendAsset",
            "--destination",
            "0x0000000000000000000000000000000000000001",
            "--sourceDex",
            "",
            "--destinationDex",
            "test",
            "--token",
            "USDC:0xeb62eee3685fc4c43992febcd9e75443",
            "--amount",
            "1",
        ]);
        parser(SendAssetRequest)(JSON.parse(data));
    },
});
