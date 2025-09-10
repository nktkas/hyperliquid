import { CWithdrawRequest, parser, SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "cWithdraw",
    topup: { evm: "0.00000001" },
    codeTestFn: async (_t, clients) => {
        // —————————— Prepare ——————————

        await clients.exchange.cDeposit({ wei: 1 });

        // —————————— Test ——————————

        const data = await Promise.all([
            clients.exchange.cWithdraw({ wei: 1 }),
        ]);
        schemaCoverage(SuccessResponse, data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["exchange", "cWithdraw", "--wei", "1"]);
        parser(CWithdrawRequest)(JSON.parse(data));
    },
});
