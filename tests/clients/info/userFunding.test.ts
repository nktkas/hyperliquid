import { parser, UserFundingRequest, UserFundingUpdate } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "userFunding",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.userFunding({
                user: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            }),
        ]);
        schemaCoverage(v.array(UserFundingUpdate), data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand([
            "info",
            "userFunding",
            "--user",
            "0xe019d6167E7e324aEd003d94098496b6d986aB05",
            "--startTime",
            "1725991238683",
        ]);
        parser(UserFundingRequest)(JSON.parse(data));
    },
});
