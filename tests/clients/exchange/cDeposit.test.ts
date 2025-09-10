import { CDepositRequest, parser, SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "cDeposit",
    topup: { evm: "0.00000001" },
    codeTestFn: async (_t, clients) => {
        const data = await Promise.all([
            clients.exchange.cDeposit({ wei: 1 }),
        ]);
        schemaCoverage(SuccessResponse, data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["exchange", "cDeposit", "--wei", "1"]);
        parser(CDepositRequest)(JSON.parse(data));
    },
});
