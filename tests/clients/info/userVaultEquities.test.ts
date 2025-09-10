import { parser, UserVaultEquitiesRequest, VaultEquity } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "userVaultEquities",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.userVaultEquities({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }),
        ]);
        schemaCoverage(v.array(VaultEquity), data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand([
            "info",
            "userVaultEquities",
            "--user",
            "0xe019d6167E7e324aEd003d94098496b6d986aB05",
        ]);
        parser(UserVaultEquitiesRequest)(JSON.parse(data));
    },
});
