import { assertRejects } from "jsr:@std/assert@1";
import { ApiRequestError, type ExchangeClient, type InfoClient, type MultiSignClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["cSignerAction"]>>;
const _MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    await t.step("jailSelf", async () => {
        await assertRejects(
            () => client.exchange.cSignerAction({ jailSelf: null }),
            ApiRequestError,
            "Signer invalid or inactive for current epoch",
        );
    });

    await t.step("unjailSelf", async () => {
        await assertRejects(
            () => client.exchange.cSignerAction({ unjailSelf: null }),
            ApiRequestError,
            "Signer invalid or inactive for current epoch",
        );
    });
}

runTest("cSignerAction", testFn);
