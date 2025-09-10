import { parser, PreTransferCheck, PreTransferCheckRequest } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "preTransferCheck",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.preTransferCheck({
                user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
                source: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
            }),
        ]);
        schemaCoverage(PreTransferCheck, data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand([
            "info",
            "preTransferCheck",
            "--user",
            "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
            "--source",
            "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
        ]);
        parser(PreTransferCheckRequest)(JSON.parse(data));
    },
});
