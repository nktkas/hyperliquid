import { UserRole } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("userRole", async (_t, client) => {
    const data = await Promise.all([
        client.userRole({ user: "0x941a505ACc11F5f3A12b5eF0d414A8Bff45c5e77" }), // role = missing
        client.userRole({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }), // role = user
        client.userRole({ user: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b" }), // role = vault
        client.userRole({ user: "0xb0b3460d7bd6c01a8d7dad8b152292bf1a47883b" }), // role = agent
        client.userRole({ user: "0x22a454d3322060475552e8f922ec0c778b8e5760" }), // role = subAccount
    ]);
    schemaCoverage(UserRole, data);
});
