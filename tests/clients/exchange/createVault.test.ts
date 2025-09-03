import { CreateVaultResponse } from "@nktkas/hyperliquid/schemas";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("createVault", async (_t, clients) => {
    await Promise.all([
        clients.exchange.createVault({
            name: "test",
            description: "1234567890",
            initialUsd: Number.MAX_SAFE_INTEGER,
            nonce: Date.now(),
        }),
    ])
        .then((data) => {
            schemaCoverage(CreateVaultResponse, data);
        }).catch((e) => {
            if (e instanceof SchemaCoverageError) throw e;
            assertIsError(e, ApiRequestError, "Insufficient balance to create vault");
        });
});
