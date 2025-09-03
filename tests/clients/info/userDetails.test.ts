import { TxDetails } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("userDetails", async (_t, client) => {
    const data = await Promise.all([
        client.userDetails({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }),
    ]);
    schemaCoverage(v.array(TxDetails), data);
});
