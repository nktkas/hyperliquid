import { assertIsError } from "jsr:@std/assert@1";
import { ApiRequestError, type ExchangeClient, type InfoClient, type MultiSignClient } from "../../../mod.ts";
import { schemaCoverage, SchemaCoverageError, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["vaultModify"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    _t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    await client.exchange.vaultModify({
        vaultAddress: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
        allowDeposits: null,
        alwaysCloseOnWithdraw: null,
    })
        .then((data) => {
            schemaCoverage(MethodReturnType, [data]);
        })
        .catch((e) => {
            if (e instanceof SchemaCoverageError) throw e;
            assertIsError(e, ApiRequestError, "Only leader can perform this vault action");
        });
}

runTest("vaultModify", testFn);
