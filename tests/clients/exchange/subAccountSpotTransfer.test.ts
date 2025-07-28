import { assertIsError } from "jsr:@std/assert@1";
import { ApiRequestError, type ExchangeClient, type InfoClient, type MultiSignClient } from "../../../mod.ts";
import { schemaCoverage, SchemaCoverageError, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["subAccountSpotTransfer"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    _t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    await client.exchange.subAccountSpotTransfer({
        subAccountUser: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
        isDeposit: true,
        token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
        amount: "1",
    })
        .then((data) => {
            schemaCoverage(MethodReturnType, [data]);
        })
        .catch((e) => {
            if (e instanceof SchemaCoverageError) throw e;
            assertIsError(e, ApiRequestError, "Invalid sub-account transfer from");
        });
}

runTest("subAccountSpotTransfer", testFn);
