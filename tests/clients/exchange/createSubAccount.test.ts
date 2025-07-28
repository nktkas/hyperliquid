import { assertIsError } from "jsr:@std/assert@1";
import { ApiRequestError, type ExchangeClient, type InfoClient, type MultiSignClient } from "../../../mod.ts";
import { schemaCoverage, SchemaCoverageError, schemaGenerator } from "../../_utils/schema/mod.ts";
import { anyFnSuccess, runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["createSubAccount"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    _t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    await client.exchange.createSubAccount({ name: String(Date.now()) })
        .then((data) => {
            schemaCoverage(MethodReturnType, [data]);
        })
        .catch((e) => {
            if (e instanceof SchemaCoverageError) throw e;
            anyFnSuccess([
                () => assertIsError(e, ApiRequestError, "Too many sub-accounts"),
                () => assertIsError(e, ApiRequestError, "Cannot create sub-accounts until enough volume traded"),
            ]);
        });
}

runTest("createSubAccount", testFn);
