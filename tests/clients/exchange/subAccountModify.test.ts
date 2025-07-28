import { assertIsError } from "jsr:@std/assert@1";
import { ApiRequestError, type ExchangeClient, type InfoClient, type MultiSignClient } from "../../../mod.ts";
import { schemaCoverage, SchemaCoverageError, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["subAccountModify"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    _t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    await client.exchange.subAccountModify({
        subAccountUser: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
        name: String(Date.now()),
    })
        .then((data) => {
            schemaCoverage(MethodReturnType, [data]);
        })
        .catch((e) => {
            if (e instanceof SchemaCoverageError) throw e;
            assertIsError(
                e,
                ApiRequestError,
                `Sub-account 0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1 is not registered to`,
            );
        });
}

runTest("subAccountModify", testFn);
