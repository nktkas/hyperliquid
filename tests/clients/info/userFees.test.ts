import { UserFees } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("userFees", async (_t, client) => {
    const data = await Promise.all([
        client.userFees({ user: "0xe973105a27e17350500926ae664dfcfe6006d924" }),
    ]);
    schemaCoverage(UserFees, data);
});
