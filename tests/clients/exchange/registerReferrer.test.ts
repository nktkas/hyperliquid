import { assertIsError } from "jsr:@std/assert@1";
import { ApiRequestError, type ExchangeClient, type InfoClient, type MultiSignClient } from "../../../mod.ts";
import { schemaCoverage, SchemaCoverageError, schemaGenerator } from "../../_utils/schema/mod.ts";
import { anyFnSuccess, runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["registerReferrer"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    _t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    await client.exchange.registerReferrer({ code: "TEST" })
        .then((data) => {
            schemaCoverage(MethodReturnType, [data]);
        })
        .catch((e) => {
            if (e instanceof SchemaCoverageError) throw e;
            anyFnSuccess([
                () => assertIsError(e, ApiRequestError, "Referral code already registered"),
                () =>
                    assertIsError(
                        e,
                        ApiRequestError,
                        "Cannot generate referral code until enough volume traded",
                    ),
            ]);
        });
}

runTest("registerReferrer", testFn);
