import { parser, SuccessResponse, Withdraw3Request } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "withdraw3",
    topup: { perp: "2" },
    codeTestFn: async (_t, clients) => {
        const data = await Promise.all([
            clients.exchange.withdraw3({
                amount: "2",
                destination: "0x0000000000000000000000000000000000000001",
            }),
        ]);
        schemaCoverage(SuccessResponse, data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand([
            "exchange",
            "withdraw3",
            "--amount",
            "2",
            "--destination",
            "0x0000000000000000000000000000000000000001",
        ]);
        parser(Withdraw3Request)(JSON.parse(data));
    },
});
