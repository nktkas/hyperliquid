import { parser, SuccessResponse, UsdSendRequest } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "usdSend",
    codeTestFn: async (_t, clients) => {
        const data = await Promise.all([
            clients.exchange.usdSend({
                destination: "0x0000000000000000000000000000000000000001",
                amount: "1",
            }),
        ]);
        schemaCoverage(SuccessResponse, data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand([
            "exchange",
            "usdSend",
            "--destination",
            "0x0000000000000000000000000000000000000001",
            "--amount",
            "1",
        ]);
        parser(UsdSendRequest)(JSON.parse(data));
    },
});
