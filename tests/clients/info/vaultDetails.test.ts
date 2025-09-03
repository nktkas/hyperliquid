import { VaultDetails } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("vaultDetails", async (_t, client) => {
    const data = await Promise.all([
        client.vaultDetails({ vaultAddress: "0x0000000000000000000000000000000000000000" }), // null
        client.vaultDetails({ vaultAddress: "0x1719884eb866cb12b2287399b15f7db5e7d775ea" }), // relationship.type = normal
        client.vaultDetails({ vaultAddress: "0x768484f7e2ebb675c57838366c02ae99ba2a9b08" }), // relationship.type = child
        client.vaultDetails({ // relationship.type = parent
            vaultAddress: "0xa15099a30bbf2e68942d6f4c43d70d04faeab0a0",
            user: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
        }),
    ]);
    schemaCoverage(v.nullable(VaultDetails), data);
});
