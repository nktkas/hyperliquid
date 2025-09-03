import { WsUserFundings } from "@nktkas/hyperliquid/schemas";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("userFundings", "api", async (_t, client) => {
    const data = await Promise.all([
        deadline(
            new Promise<WsUserFundings>((resolve) => {
                client.userFundings({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, resolve);
            }),
            10_000,
        ),
    ]);
    schemaCoverage(WsUserFundings, data, {
        ignoreUndefinedTypes: ["#/properties/isSnapshot"],
    });
});
