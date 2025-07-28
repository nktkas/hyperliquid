import { assertIsError } from "jsr:@std/assert@1";
import { ApiRequestError, type ExchangeClient, type InfoClient, type MultiSignClient } from "../../../mod.ts";
import { schemaCoverage, SchemaCoverageError, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["scheduleCancel"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    _t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    await client.exchange.scheduleCancel({ time: Date.now() + 30000 })
        .then((data) => {
            schemaCoverage(MethodReturnType, [data]);
        })
        .catch((e) => {
            if (e instanceof SchemaCoverageError) throw e;
            assertIsError(e, ApiRequestError, "Cannot set scheduled cancel time until enough volume traded");
        });
}

runTest("scheduleCancel", testFn);
